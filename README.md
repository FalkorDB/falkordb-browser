
[![Dockerhub](https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker)](https://hub.docker.com/r/falkordb/falkordb-browser/)
[![Discord](https://img.shields.io/discord/1146782921294884966?style=flat-square)](https://discord.gg/6M4QwDXn2w)
[![Workflow](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml)

# FalkorDB Browser

[![Try Free](https://img.shields.io/badge/Try%20Free-FalkorDB%20Cloud-FF8101?labelColor=FDE900&style=for-the-badge&link=https://app.falkordb.cloud)](https://app.falkordb.cloud)

> 🎉 JUNE 2025 NEW UPDATE: Improved UI & Experience 

## Visualize, manipulate and manage FalkorDB graph data interactively to monitor and explore data changes. The latest version introcused the following improvements
![FalkorDB browser 06-25](https://github.com/user-attachments/assets/bc0060d0-1b55-484a-8e88-9c72b5085e55)

#### Faster Graph Creation & Querying  
Quickly create new graphs and run queries with fewer clicks. The UI now guides you through graph setup with smarter defaults and clearer feedback.

#### Simplified Node Editing  
Editing node properties is now faster and more intuitive. Fewer modal windows, inline property editing, and immediate updates make this flow significantly more usable.

#### Query History Panel  
A new history panel stores your recent queries. This makes it easier to iterate, profile, debug, or rerun past queries without leaving the editor.

#### Better Search  
The search bar now indexes schema, nodes, and metadata. Results are ranked more effectively and load with lower latency.

#### Expanded Settings & User Controls  
New options let you fine-tune database behavior, toggle visual preferences, and manage users without falling back to CLI tools.



| ![image (4)](https://github.com/user-attachments/assets/658fa59f-5316-475c-8bd7-b26651e9902c) | ![FalkorDB browser 06-25](https://github.com/user-attachments/assets/ee907fa6-038c-462b-9240-456a2d2c2a99) |
|---------------------------------------------------|---------------------------------------------------|


## Get Started & Demo

Access the Browser: (https://browser.falkordb.com)

### Quick start

#### Run the graph database and browser from one docker container

**Step 1:**
```
docker run -p 3000:3000 -p 6379:6379 -it --rm falkordb/falkordb:latest
```
**Step 2:**

Open [http://localhost:3000](http://localhost:3000) with your browser.

> Note: Alternativly, you can run the browser from source and database using Docker

### Run the graph database from Docker container

```
docker run -p 6379:6379 -it --rm falkordb/falkordb:latest
```

### Build and run browser from source

* Clone the git repository `git clone git@github.com:FalkorDB/falkordb-browser.git`
* Create .env.local in the clone directory `cp .env.local.template .env.local`
* Build the node project `npm -i`
* run the server `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser.







