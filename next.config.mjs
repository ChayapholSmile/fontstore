/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "mongodb",
      "mongoose",
      "bcryptjs",
      "jsonwebtoken",
      "snappy",
      "@mongodb-js/zstd",
      "kerberos",
      "mongodb-client-encryption",
      "gcp-metadata",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }

      config.externals = config.externals || []
      config.externals.push({
        mongodb: "commonjs mongodb",
        bcryptjs: "commonjs bcryptjs",
        jsonwebtoken: "commonjs jsonwebtoken",
        snappy: "commonjs snappy",
        aws4: "commonjs aws4", // Added aws4 to externals to resolve warning
      })
    }

    return config
  },
}

export default nextConfig
