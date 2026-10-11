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

`npm test` covers the server-URL rules in `capacitor.config.ts` and the
release version stamping (`scripts/android-version.sh`).

CI (`.github/workflows/mobile.yml`) runs those tests, lints the CloudFormation
template and builds a debug APK on every change to `mobile/`. iOS builds need certificates
and a macOS runner, so they aren't in CI yet.

## Try it on a phone (development)

No AWS or HTTPS needed: a debug APK opens a browser running on your machine.

1. Run the browser where the phone can reach it, with `AUTH_URL` set to the
   address the phone will use (sign-in redirects there):

   ```sh
   AUTH_URL=http://192.168.1.52:3000 npm run dev -- -H 0.0.0.0   # from the repo root
   ```

   To let the browser's "Get the app" popup offer the dev APK as well, add
   `ANDROID_APP_URL=http://192.168.1.52:8000/FalkorDB-Browser-android-dev.apk APP_LINKS_ALLOW_HTTP=1`.

2. Build the APK. It needs the Android SDK and a JDK 21 (`ANDROID_HOME`, `JAVA_HOME`):

   ```sh
   cd mobile
   FALKORDB_BROWSER_URL=http://192.168.1.52:3000 npm run dev:android
   ```

   The URL defaults to `http://<this machine's LAN IP>:3300`. Plain http is
   allowed through the debug manifest only, never in a release build.

3. Serve it and install it on the phone (allow "install unknown apps" once):

   ```sh
   (cd dist && python3 -m http.server 8000)
   # on the phone: http://192.168.1.52:8000/FalkorDB-Browser-android-dev.apk
   ```

## Release builds (Android)

Publishing a GitHub release builds a signed APK that opens the production
browser and attaches it to the release as `FalkorDB-Browser-android.apk`, next
to the desktop installers. Until the settings below exist, the release goes
out without it and the workflow logs a warning.

One-time setup:

1. Create a signing key, and keep it safe. Android only installs an update
   signed with the same key, so losing it strands every existing install:

   ```sh
   keytool -genkeypair -v -keystore falkordb-release.jks -alias falkordb \
     -keyalg RSA -keysize 4096 -validity 10000
   base64 -w0 falkordb-release.jks   # value for ANDROID_KEYSTORE_BASE64
   ```

2. In the repository settings, add the secrets `ANDROID_KEYSTORE_BASE64`,
   `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD`,
   and the variable `FALKORDB_BROWSER_URL` (the production https address).

3. On that production deployment, point the browser's popup at the APK:
   `ANDROID_APP_URL=https://github.com/FalkorDB/falkordb-browser/releases/latest/download/FalkorDB-Browser-android.apk`
   (`AndroidAppUrl` in `aws/browser-service.yml`). Only there: the APK opens
   that server, so other deployments should leave it unset.

Each release's version becomes the app's `versionName`, and `versionCode` is
derived from it (v2.6.1 → 20601), so a newer APK installs over the old one.
For Google Play later, the same key and workflow can build an AAB instead
(`--androidreleasetype AAB`).

## Store review

Apple's guideline 4.2 rejects apps that only wrap a website. Before submitting
to the App Store, plan some native value (for example push notifications,
biometric unlock, or share-sheet import of CSVs). Google Play is less strict.
