import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// aws/deploy.sh against a stand-in AWS CLI that plays back a stack's state and
// records what the script asked for. Nothing here reaches AWS.

const deployScript = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "aws", "deploy.sh");

const FAKE_AWS = `#!/bin/sh
log() { echo "$1" >> "$FAKE_DIR/calls"; }
case "$*" in
  *describe-stacks*StackStatus*)
    case "$FAKE_STATUS" in
      missing) echo "An error occurred (ValidationError) when calling the DescribeStacks operation: Stack with id s does not exist" >&2; exit 254 ;;
      throttled) echo "An error occurred (Throttling): Rate exceeded" >&2; exit 254 ;;
      *) echo "$FAKE_STATUS" ;;
    esac ;;
  *describe-stack-resource*TokenStorageSecret*)
    [ -n "$FAKE_PREVIOUS_URL" ] && echo "arn:aws:secretsmanager:token" || { echo "An error occurred (ValidationError): Resource TokenStorageSecret does not exist for stack s" >&2; exit 254; } ;;
  *"secretsmanager get-secret-value"*) echo "$FAKE_PREVIOUS_URL" ;;
  *describe-stacks*ClusterName*) echo "the-cluster" ;;
  *describe-stacks*ServiceName*) echo "the-service" ;;
  *"ecs update-service"*) log restart; [ "$FAKE_RESTART" = fail ] && exit 254; : ;;
  *"ecs wait services-stable"*) log wait; [ "$FAKE_WAIT" = fail ] && exit 255; : ;;
  *" deploy "*)
    log deploy
    for arg in "$@"; do case "$arg" in file://*) cp "\${arg#file://}" "$FAKE_DIR/params.json" ;; esac; done
    echo "$*" > "$FAKE_DIR/deploy-argv" ;;
  *) : ;;
esac
`;

type Run = {
    status: number | null;
    stderr: string;
    calls: string[];
    params: string[];
    argv: string;
};

function deploy(stack: {
    status: string;
    previousUrl?: string;
    restart?: "ok" | "fail";
    wait?: "ok" | "fail";
}, env: Record<string, string> = {}): Run {
    const dir = mkdtempSync(path.join(tmpdir(), "falkordb-deploy-"));
    const aws = path.join(dir, "aws");
    writeFileSync(aws, FAKE_AWS);
    chmodSync(aws, 0o755);
    const result = spawnSync("sh", [deployScript], {
        encoding: "utf8",
        env: {
            PATH: `${dir}:${process.env.PATH}`,
            FAKE_DIR: dir,
            FAKE_STATUS: stack.status,
            FAKE_PREVIOUS_URL: stack.previousUrl ?? "",
            FAKE_RESTART: stack.restart ?? "ok",
            FAKE_WAIT: stack.wait ?? "ok",
            STACK_NAME: "s",
            BROWSER_URL: "https://browser.example.com",
            CERTIFICATE_ARN: "arn:aws:acm:cert",
            VPC_ID: "vpc-1",
            SUBNET_IDS: "subnet-a,subnet-b",
            ...env,
        },
    });
    const read = (name: string) => (existsSync(path.join(dir, name)) ? readFileSync(path.join(dir, name), "utf8") : "");
    return {
        status: result.status,
        stderr: result.stderr,
        calls: read("calls").split("\n").filter(Boolean),
        params: read("params.json") ? (JSON.parse(read("params.json")) as string[]) : [],
        argv: read("deploy-argv"),
    };
}

const keys = (run: Run) => run.params.map((p) => p.split("=")[0]);

test("a new stack gets freshly generated secrets, and they never reach argv", () => {
    const run = deploy({ status: "missing" });
    assert.equal(run.status, 0);
    assert.ok(keys(run).includes("AuthSecret") && keys(run).includes("EncryptionKey"));
    const secret = run.params.find((p) => p.startsWith("AuthSecret="))?.split("=")[1];
    assert.match(secret ?? "", /^[0-9a-f]{64}$/);
    assert.ok(!run.argv.includes(secret ?? "-"), "the secret must not be on the command line");
});

test("an existing stack keeps its secrets", () => {
    const run = deploy({ status: "UPDATE_COMPLETE" });
    assert.equal(run.status, 0);
    assert.ok(!keys(run).includes("AuthSecret") && !keys(run).includes("EncryptionKey"));
});

test("an unclear stack state deploys nothing", () => {
    for (const status of ["throttled", "ROLLBACK_COMPLETE", "UPDATE_IN_PROGRESS"]) {
        const run = deploy({ status });
        assert.equal(run.status, 1, status);
        assert.ok(!run.calls.includes("deploy"), status);
    }
});

test("a changed token store URL restarts the service and waits for it", () => {
    const run = deploy({ status: "UPDATE_COMPLETE", previousUrl: "falkors://a@db:1" }, { TOKEN_STORAGE_URL: "falkors://b@db:2" });
    assert.equal(run.status, 0);
    assert.deepEqual(run.calls, ["deploy", "restart", "wait"]);
});

test("an unchanged or first-time token store URL does not restart", () => {
    const same = deploy({ status: "UPDATE_COMPLETE", previousUrl: "falkors://a@db:1" }, { TOKEN_STORAGE_URL: "falkors://a@db:1" });
    assert.deepEqual(same.calls, ["deploy"]);
    // Adding it changes the task definition, so CloudFormation replaces the tasks itself.
    const first = deploy({ status: "UPDATE_COMPLETE" }, { TOKEN_STORAGE_URL: "falkors://a@db:1" });
    assert.deepEqual(first.calls, ["deploy"]);
});

test("a restart that fails says how to finish it, and FORCE_RESTART=1 does", () => {
    for (const stack of [{ restart: "fail" as const }, { wait: "fail" as const }]) {
        const run = deploy({ status: "UPDATE_COMPLETE", previousUrl: "falkors://a@db:1", ...stack }, { TOKEN_STORAGE_URL: "falkors://b@db:2" });
        assert.equal(run.status, 1, JSON.stringify(stack));
        assert.match(run.stderr, /FORCE_RESTART=1/);
    }
    // The rerun: the URL is already saved, so only the flag can bring the restart back.
    const retry = deploy({ status: "UPDATE_COMPLETE", previousUrl: "falkors://b@db:2" }, { TOKEN_STORAGE_URL: "falkors://b@db:2", FORCE_RESTART: "1" });
    assert.equal(retry.status, 0);
    assert.deepEqual(retry.calls, ["deploy", "restart", "wait"]);
});

test("FORCE_RESTART=1 on a brand-new stack has nothing to restart", () => {
    const run = deploy({ status: "missing" }, { FORCE_RESTART: "1" });
    assert.equal(run.status, 0);
    assert.deepEqual(run.calls, ["deploy"]);
});
