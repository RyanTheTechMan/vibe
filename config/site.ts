export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "VIBE",
  description: "A modern take on your stock portfolio.",
  navItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Stocks",
      href: "/stock",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Stocks",
      href: "/stock",
    },
    {
        label: "About",
        href: "/about",
    }
  ],
};
