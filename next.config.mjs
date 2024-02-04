/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.web3modal.org",
            }
        ],
    },
    webpack: config => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding')
        return config
    }
};

export default nextConfig;
