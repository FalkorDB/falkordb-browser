# FalkorDB Browser — desktop app

An Electron shell around the regular browser build. The browser is a
server-rendered Next.js app, so the shell runs the same standalone `server.js`
the Docker image runs, on `127.0.0.1`, and opens a window on it. Nothing in the
web app changes for this.

## Build

```sh
cd desktop
npm ci
npm start        # uses an existing root build: run `npm run build:web` first
npm run dist     # builds the web app, then installers into desktop/dist
npm test         # the shell's own logic (lib/shell.cjs), no Electron needed
```

Installers are built for the OS you run on (AppImage, dmg/zip, or nsis exe),
because the server's native modules (`@falkordb/text-to-cypher`) are traced
for the build machine. CI builds all three: `.github/workflows/desktop.yml`.

## At runtime

- State lives in the OS app-data directory (`~/.config/FalkorDB Browser` on
  Linux, `~/Library/Application Support/FalkorDB Browser` on macOS,
  `%APPDATA%\FalkorDB Browser` on Windows): `secrets.json` (the generated
  `AUTH_SECRET`/`ENCRYPTION_KEY`), API tokens under `data/`, and LOAD CSV temp
  files under `import/`.
- The server listens on port 3210, or, if something else holds that port, on a
  free one, which it then keeps using. The browser keeps its settings in
  origin-scoped `localStorage`, so they stay put as long as the port does; a move
  to a new port starts the settings over once.
- Environment variables are passed through, so the documented `FALKORDB_*`
  preconfigured connection settings work here too.
- Links to other sites open in the system browser.
- **CSV import (LOAD CSV):** uploads are written to `import/` in the app-data
  folder and handed to FalkorDB as `file://` paths, which FalkorDB resolves
  against its own import folder. That works when FalkorDB runs on the same
  machine with `IMPORT_FOLDER` pointing at that `import/` folder. For a remote
  database, start the app with S3 settings (`CSV_STORAGE=s3` and the `S3_*`
  variables from `.env.local.template`); for a database that cannot read files
  at all, set `LOAD_CSV_FILE_URI=false` so the editor says so up front.

## Not done yet

- **Code signing:** builds are unsigned (`CSC_IDENTITY_AUTO_DISCOVERY=false` in
  CI). To sign, set electron-builder's `CSC_LINK`/`CSC_KEY_PASSWORD`, plus
  Apple notarization credentials for macOS.
- **App icon:** electron-builder's default icon is used. Add `build/icon.png`
  (512×512 or larger) and set `directories.buildResources: build`.
