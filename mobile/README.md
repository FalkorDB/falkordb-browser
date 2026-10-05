# FalkorDB Browser — mobile app (iOS / Android) on AWS

A phone cannot run the browser's Next.js server, so this has two parts:

1. **`aws/`**: runs the published `falkordb/falkordb-browser` Docker image on
   ECS Fargate behind an HTTPS Application Load Balancer.
2. **The Capacitor shell**: a native iOS/Android app that opens that HTTPS
   URL.

The browser server, not the phone, connects to FalkorDB, so the database must
be reachable from the AWS tasks.

## 1. Deploy the server to AWS

Before you start, you need:

- a VPC with two or more public subnets in different AZs
- an ACM certificate for your hostname, in the same region
- AWS CLI credentials

```sh
cd mobile
STACK_NAME=falkordb-browser \
BROWSER_URL=https://browser.example.com \
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/... \
VPC_ID=vpc-0123 SUBNET_IDS=subnet-aaa,subnet-bbb \
npm run deploy:aws
```

Point the hostname's DNS at the `LoadBalancerDns` output. The script generates
`AUTH_SECRET` and `ENCRYPTION_KEY` on first create only and stores them in
Secrets Manager. Later runs keep the existing values. To roll out a new image,
run the script again with `IMAGE_URI` set to the new tag (`:latest` does not
redeploy by itself).

This uses ECS rather than App Runner, which stopped accepting new customers on
2026-04-30.

Each task keeps its own API tokens (`.data/`) and rate-limit counters, and loses
them when it is replaced. That's why `DesiredCount` defaults to 1. Mount EFS at
`/app/.data` if tokens must survive redeploys.

## 2. Build the app

```sh
cd mobile
npm ci
export FALKORDB_BROWSER_URL=https://browser.example.com   # must be https
npx cap add android      # once; creates mobile/android (commit it)
npx cap add ios          # once, on macOS; creates mobile/ios (commit it)
npx cap sync             # after changing the URL or config
npx cap open android     # build / sign / run in Android Studio
npx cap open ios         # build / sign / run in Xcode
```

The URL is baked in at `cap sync` time. A build without one shows a "no server
configured" page (`www/index.html`). Only the browser's own host stays inside
the app; other links open in the system browser.

CI (`.github/workflows/mobile.yml`) lints the CloudFormation template and
builds a debug APK. Set the repository variable `FALKORDB_BROWSER_URL` to bake
in the real URL. Release signing and iOS builds need certificates and a macOS
runner, so they aren't in CI yet.

## Store review

Apple's guideline 4.2 rejects apps that only wrap a website. Before submitting
to the App Store, plan some native value (for example push notifications,
biometric unlock, or share-sheet import of CSVs). Google Play is less strict.
