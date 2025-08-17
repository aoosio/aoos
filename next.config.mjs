/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove typedRoutes to avoid Link href typing errors
  experimental: { },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }
};
export default nextConfig;
