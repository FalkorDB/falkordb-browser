
[![Dockerhub](https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker)](https://hub.docker.com/r/falkordb/falkordb-browser/)
[![Discord](https://img.shields.io/discord/1146782921294884966?style=flat-square)](https://discord.gg/6M4QwDXn2w)
[![Workflow](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml)

FalkorDB-Browser is a visualization UI for FalkorDB.

To see a running demo check: https://browser.falkordb.com/

![image](https://github.com/FalkorDB/falkordb-browser/assets/753206/51a81ef9-6bb2-40ce-ad9b-6381978c7562)

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



