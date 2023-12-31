/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: true,
    },
    images: {
        domains: ["localhost", "https://bingkarya.vercel.app/", "firebasestorage.googleapis.com", "https://lh3.googleusercontent.com"],
    },
    async redirects() {
        return [
            {
                source: "/collection",
                destination: "/collection/photography",
                permanent: true,
            },
            {
                source: "/create",
                destination: "/create/photo",
                permanent: true,
            },
            {
                source: "/profile",
                destination: "/profile/account",
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
