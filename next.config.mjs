/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [

                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; connect-src 'self' https://api.dscvr.one https://api1.stg.dsscvr.one https://mainnet.helius-rpc.com;",
                    },

                ],
            },
        ];
    },
};

export default nextConfig;