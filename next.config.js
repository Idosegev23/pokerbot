/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.gstatic.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    // הגדרות עבור polyfills לתמיכה בחבילות node בצד הדפדפן
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      process: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      fs: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 