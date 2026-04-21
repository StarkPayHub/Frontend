import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyStub = path.resolve(__dirname, "lib/empty-stub.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["starkzap"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Stub all optional/unused starkzap deps that aren't installed
    const stubs = [
      "@farcaster/mini-app-solana",
      "@solana/web3.js",
      "@solana/wallet-adapter-base",
      "@hyperlane-xyz/sdk",
      "@hyperlane-xyz/utils",
      "@hyperlane-xyz/core",
      "@hyperlane-xyz/registry",
      "@fatsolutions/tongo-sdk",
      "@layerzerolabs/lz-evm-oapp-v2",
      "@layerzerolabs/lz-evm-protocol-v2",
    ];

    const stubAliases = Object.fromEntries(stubs.map((pkg) => [pkg, emptyStub]));
    config.resolve.alias = {
      ...config.resolve.alias,
      ...stubAliases,
      // Pin ethers to Frontend's node_modules so nested packages find it
      "ethers": path.resolve(__dirname, "node_modules/ethers"),
      // Alias starknet-v9 -> starkzap's nested starknet (needed for API routes
      // that sign Starknet 0.14 v3 transactions; our top-level starknet v6 can't)
      "starknet-v9": path.resolve(__dirname, "node_modules/starkzap/node_modules/starknet"),
    };

    // Catch-all: any remaining unresolved optional dep → empty stub
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap("StubMissing", (factory) => {
          factory.hooks.resolve.tapAsync("StubMissing", (data, callback) => {
            callback();
          });
        });
      },
    });

    return config;
  },
};

export default nextConfig;
