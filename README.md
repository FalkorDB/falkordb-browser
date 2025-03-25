
[![Dockerhub](https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker)](https://hub.docker.com/r/falkordb/falkordb-browser/)
[![Discord](https://img.shields.io/discord/1146782921294884966?style=flat-square)](https://discord.gg/6M4QwDXn2w)
[![Workflow](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml)

# FalkorDB-Browser

[![Try Free](https://img.shields.io/badge/Try%20Free-FalkorDB%20Cloud-FF8101?labelColor=FDE900&style=for-the-badge&link=https://app.falkordb.cloud)](https://app.falkordb.cloud)

FalkorDB-Browser is a visualization UI for FalkorDB.

To see a running demo, check: https://browser.falkordb.com/

![image](https://github.com/user-attachments/assets/c1e3c868-fc73-421c-a299-29004aa86f2a)

![image](https://github.com/user-attachments/assets/58ebc352-31bd-495e-ad8b-2fdc36f5a656)


### Quick start

#### Run graph database and browser from one docker container

```
docker run -p 3000:3000 -p 6379:6379 -it --rm falkordb/falkordb:latest
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## Alternativly you can run the browser from source and database using docker

### Run graph database from docker container

```
docker run -p 6379:6379 -it --rm falkordb/falkordb:latest
```

### Build and run browser from source

* Clone the git repository `git clone git@github.com:FalkorDB/falkordb-browser.git`
* Create .env.local in the clone directory `cp .env.local.template .env.local`
* Build the node project `npm -i`
* run the server `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser.




