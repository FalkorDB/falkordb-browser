/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Keep falkordb server-only to avoid bundling BigInt in client/runtime
  // Keep text-to-cypher external to avoid bundling native .node binaries
  serverExternalPackages: ['falkordb', '@falkordb/text-to-cypher'],
  images: {
    unoptimized: true
  },
  // Enable Turbopack with SVG handling
  turbopack: {
    rules: {
      // Convert SVG imports to React components using @svgr/webpack
      // This preserves the behavior from the webpack config below
      // 
      // Usage:
      //   import Logo from './logo.svg'           → React component
      //   import logoUrl from './logo.svg?url'    → string URL (Next.js built-in handling)
      // 
      // Note: Turbopack uses Next.js built-in asset handling for ?url query params,
      // so *.svg?url imports will return the file URL instead of a React component
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  // Webpack config (only used when NOT using Turbopack, i.e., webpack build mode)
  // The SVG handling has been migrated to turbopack.rules above for Turbopack mode
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
}

module.exports = nextConfig
