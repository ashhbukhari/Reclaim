/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "connect-src 'self' https://solana-mainnet.g.alchemy.com;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;