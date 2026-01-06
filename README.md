<div align="center"> <h1>FalkorDB Browser</h1></div>

<div align="center"> <h2>Visualize, manipulate and manage FalkorDB graph data interactively to monitor and explore data changes.</h2></div>

[![Try Free](https://img.shields.io/badge/Try%20Free-FalkorDB%20Cloud-FF8101?labelColor=FDE900&style=for-the-badge&link=https://app.falkordb.cloud)](https://app.falkordb.cloud)

[![Dockerhub](https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker)](https://hub.docker.com/r/falkordb/falkordb-browser/)
[![Discord](https://img.shields.io/discord/1146782921294884966?style=flat-square)](https://discord.gg/6M4QwDXn2w)
[![Workflow](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml)

<img width="1423" height="766" alt="FalkorDB Browser 01-2026" src="https://github.com/user-attachments/assets/ca5d3c44-8848-429a-a846-429ab777663a" />

## Features & Functionalities
> 🎉 December 2025 Update: Improved UI & User Controls 

| Feature | Description |
| :--- | :--- |
| **Faster Graph Creation & Querying** | Quickly create new graphs and run queries with fewer clicks. The UI now guides you through graph setup with smarter defaults and clearer feedback. |
| **Simplified Node Editing** | Editing node properties is now faster and more intuitive. Fewer modal windows, inline property editing, and immediate updates make this flow significantly more usable. |
| **Query History Panel** | A new history panel stores your recent queries. This makes it easier to iterate, profile, debug, or rerun past queries without leaving the editor. |
| **Better Search** | The search bar now indexes schema, nodes, and metadata. Results are ranked more effectively and load with lower latency. |
| **Expanded Settings & User Controls** | New options let you fine-tune database behavior, toggle visual preferences, and manage users without falling back to CLI tools. |
| **Node Style Customization** | Customize the visual appearance of nodes per label. Select custom colors from a palette, adjust node sizes, and choose which property to display as the node caption. All customizations are saved per graph and persist across sessions. |



| ![image (4)](https://github.com/user-attachments/assets/658fa59f-5316-475c-8bd7-b26651e9902c) | ![FalkorDB browser 06-25](https://github.com/user-attachments/assets/ee907fa6-038c-462b-9240-456a2d2c2a99) |
|---------------------------------------------------|---------------------------------------------------|

## Getting Started & Demo

### Quick Start: Docker Deployment

The following command runs both the FalkorDB database and the browser interface within a single container.

#### 1. Start the container
```bash
docker run -p 3000:3000 -p 6379:6379 -it --rm falkordb/falkordb:latest

```

#### 2. Access the application

Navigate to [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your web browser.

#### Configuration for Custom URLs

If the application is hosted on a specific domain, define the `NEXTAUTH_URL` environment variable:

```bash
docker run -p 3000:3000 -e "NEXTAUTH_URL=[https://www.yoururl.com](https://www.yoururl.com)" -p 6379:6379 -it --rm falkordb/falkordb:latest

```

---

### Alternative Setup: Local Development

This method involves running the database engine in Docker while executing the browser source code on your local machine.

#### 1. Run the Database

```bash
docker run -p 6379:6379 -it --rm falkordb/falkordb:latest

```

#### 2. Build and Run the Browser

Execute the following commands in your terminal:

1. **Clone the repository:**
```bash
git clone git@github.com:FalkorDB/falkordb-browser.git
cd falkordb-browser

```


2. **Initialize environment variables:**
```bash
cp .env.local.template .env.local

```


3. **Install dependencies:**
```bash
npm install

```


4. **Start the server:**
```bash
npm run dev

```

The interface will be accessible at [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).


