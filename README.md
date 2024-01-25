FalkorDB-Browser is a vizualization UI for FalkorDB.

To see a running demo check: https://browser.falkordb.com/

![image](https://github.com/FalkorDB/falkordb-browser/assets/753206/51a81ef9-6bb2-40ce-ad9b-6381978c7562)



## Getting Started

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

