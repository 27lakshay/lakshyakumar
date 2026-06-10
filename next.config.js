module.exports = {
  allowedDevOrigins: ["192.168.68.107"],
  async redirects() {
    return [
      {
        source: "/resume",
        destination: "/resume.pdf",
        permanent: true,
      },
    ];
  },
};
