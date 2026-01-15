/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/upload-images",
        destination: "http://localhost:4000/api/upload-images",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:4000/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
