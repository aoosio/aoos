/** @type {import('next').NextConfig} */
const nextConfig = {
  // أزِل أي `output: 'export'` قديم. هذا يجعل البناء Node/SSR عادي.
  output: 'standalone',

  // خيارياً: إن كنت سابقاً على export وواجهت مشاكل صور
  images: { unoptimized: true },
}

export default nextConfig
