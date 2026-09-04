import type { NextConfig } from "next";

// Hosts that should land on the Solomon product page while keeping their
// own branded URL in the address bar (rewrite, not redirect).
const SOLOMON_HOSTS = ["solomon-os.ai", "www.solomon-os.ai"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Founder page moved; keep old links working.
      { source: "/marshal", destination: "/founder", permanent: true },
    ];
  },
  async rewrites() {
    return SOLOMON_HOSTS.map((host) => ({
      source: "/",
      has: [{ type: "host" as const, value: host }],
      destination: "/solomon",
    }));
  },
};

export default nextConfig;
