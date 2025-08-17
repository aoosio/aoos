/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }
};
export default nextConfig;
