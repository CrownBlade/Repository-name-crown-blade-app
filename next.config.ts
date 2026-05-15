const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
});

const nextConfig = {
  allowedDevOrigins: ["192.168.1.72"],
};

module.exports = withPWA(nextConfig);