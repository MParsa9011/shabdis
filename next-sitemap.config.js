/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tabarjin.ir",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/api", "/checkout", "/profile"] },
    ],
  },
  exclude: ["/admin/*", "/api/*", "/checkout/*", "/profile/*", "/auth/*"],
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async (config) => [
    await config.transform(config, "/"),
    await config.transform(config, "/products"),
    await config.transform(config, "/blog"),
    await config.transform(config, "/about"),
  ],
};
