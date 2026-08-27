/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // RainbowKit statically imports wagmi's Base Account connector, which pulls in
  // @base-org/account → @coinbase/cdp-sdk. That SDK lazily imports optional
  // @x402/* micropayment modules we never install or call. Keep these Node-only
  // packages out of the bundle graph so their optional dynamic imports aren't
  // traced during the build (the Base Account wallet isn't in our connector
  // list, so this code path is never executed).
  serverExternalPackages: ["@base-org/account", "@coinbase/cdp-sdk"],
};

export default nextConfig;
