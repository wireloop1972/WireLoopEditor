/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'ws'];
    }
    return config;
  },
  // Ensure we can use WebSocket in Edge Runtime
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
  // Optimize WebSocket connections
  serverRuntimeConfig: {
    ws: {
      port: 3001,
      path: '/mcp',
      backlog: 100,
      clientTracking: true,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    }
  }
};

module.exports = nextConfig; 