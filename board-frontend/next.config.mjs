/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // API 프록시 설정 (개발 환경에서 CORS 문제 해결용)
  async rewrites() {
    return [
      // OAuth2 리다이렉트는 직접 백엔드로
    ];
  },
};

export default nextConfig;
