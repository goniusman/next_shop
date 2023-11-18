module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true, // (optional)
  // sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        // allow: '/',
        disallow: ['*/logout', '*/checkout*', '*/404', '*/profile'],
      },
    ],
  },
  exclude: [
    '*/404',
    '*/change-password',
    '*/downloads',
    '*/logout',
    '*/refunds',
    '*/profile',
    '*/checkout*',
    '*/orders*',
  ],
};
