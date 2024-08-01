
[![Dockerhub](https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker)](https://hub.docker.com/r/falkordb/falkordb-browser/)
[![Discord](https://img.shields.io/discord/1146782921294884966?style=flat-square)](https://discord.gg/6M4QwDXn2w)
[![Workflow](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml)

# FalkorDB-Browser

[![Try Free](https://img.shields.io/badge/Try%20Free-FalkorDB%20Cloud-FF8101?labelColor=FDE900&style=for-the-badge&link=https://app.falkordb.cloud)](https://app.falkordb.cloud)

FalkorDB-Browser is a visualization UI for FalkorDB.

To see a running demo, check: https://browser.falkordb.com/

![image](https://github.com/user-attachments/assets/c1e3c868-fc73-421c-a299-29004aa86f2a)

![image](https://github.com/user-attachments/assets/58ebc352-31bd-495e-ad8b-2fdc36f5a656)

## Run in Docker

```
sudo docker run -p 3000:3000 -it falkordb/falkordb-browser:edge
```

## Development - Getting Started 

First copy the `.env.local.template` as `.env.local`.

Then, it is a [Next.js](https://nextjs.org/) project. To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Running FalkorDB database

```
docker run -p 6379:6379 -it --rm falkordb/falkordb:latest
```



