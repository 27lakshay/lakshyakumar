module.exports = {
  allowedDevOrigins: ["192.168.68.107"],
  async rewrites() {
    return [
      {
        source: "/resume",
        destination: "/resume.pdf",
      },
    ];
  },
};
