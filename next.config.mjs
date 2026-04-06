import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyStub = path.resolve(__dirname, "lib/empty-stub.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Replace optional peer deps with an empty stub instead of `false`
    // (webpack `false` alias causes runtime crashes in Next.js dev mode)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": emptyStub,
      "@solana/web3.js": emptyStub,
      "@solana/wallet-adapter-base": emptyStub,
      // starkzap — not on npm yet; swap for stub until installed
      "starkzap": emptyStub,
    };

    return config;
  },
};

export default nextConfig;
