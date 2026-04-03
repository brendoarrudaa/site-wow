import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X, ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";

const navCategories = [
  {
    labelKey: "nav.categoryServer",
    links: [
      { labelKey: "nav.howToPlay", href: "/como-jogar" },
      { labelKey: "nav.download", href: "/download" },
      { labelKey: "nav.rates", href: "/rates" },
      { labelKey: "nav.status", href: "/status" },
      { labelKey: "nav.roadmap", href: "/roadmap" },
    ],
  },
  {
    labelKey: "nav.categoryCommunity",
    links: [
      { labelKey: "nav.blog", href: "/blog" },
      { labelKey: "nav.community", href: "/comunidade" },
      { labelKey: "nav.faq", href: "/faq" },
    ],
  },
  {
    labelKey: "nav.categorySupport",
    links: [
      { labelKey: "nav.rules", href: "/regras" },
      { labelKey: "nav.suggestions", href: "/sugestoes" },
      { labelKey: "nav.bugs", href: "/bugs" },
    ],
  },
];

const topLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.vip", href: "/vip" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenCategory(null);
  }, [router.pathname]);

  const isActive = (href: string) => router.pathname === href;

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm rounded-md transition-all duration-200 ${
      isActive(href)
        ? "text-primary font-medium bg-primary/8"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-gold-light via-gold to-accent flex items-center justify-center shadow-md shadow-gold/20 group-hover:shadow-gold/30 transition-shadow">
            <span className="font-serif text-sm font-bold text-primary-foreground">AL</span>
          </div>
          <span className="font-serif text-lg font-bold text-foreground hidden sm:block tracking-wide">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {topLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {t(link.labelKey)}
            </Link>
          ))}

          {navCategories.map((cat) => (
            <div key={cat.labelKey} className="relative">
              <button
                onClick={() => setOpenCategory(openCategory === cat.labelKey ? null : cat.labelKey)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-all duration-200 flex items-center gap-1 hover:bg-muted/50"
              >
                {t(cat.labelKey)}
                <ChevronDown className={`h-3 w-3 transition-transform ${openCategory === cat.labelKey ? "rotate-180" : ""}`} />
              </button>
              {openCategory === cat.labelKey && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenCategory(null)} />
                  <div className="absolute left-0 top-full mt-2 w-44 rounded-lg border border-border/80 bg-card/95 backdrop-blur-xl p-1.5 shadow-xl shadow-background/60 z-50">
                    {cat.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpenCategory(null)}
                        className={`block ${linkClass(link.href)}`}
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <Link href="/cadastro" className="btn btn-sm btn-outline border-gold/60 text-gold hover:bg-gold hover:text-black hover:border-gold">
            {t("nav.register")}
          </Link>
          <Link href="/como-jogar" className="btn btn-sm bg-gold text-black hover:bg-gold/90 border-0">
            {t("nav.playNow")}
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/30 bg-background/98 backdrop-blur-xl">
          <nav className="page-container py-4 flex flex-col gap-1">
            {topLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm rounded-lg transition-all ${
                  isActive(link.href)
                    ? "text-primary font-medium bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {navCategories.map((cat) => (
              <div key={cat.labelKey}>
                <button
                  onClick={() => setOpenCategory(openCategory === cat.labelKey ? null : cat.labelKey)}
                  className="w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg flex items-center justify-between transition-all"
                >
                  <span className="font-medium text-foreground/70 uppercase text-xs tracking-wider">{t(cat.labelKey)}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${openCategory === cat.labelKey ? "rotate-180" : ""}`} />
                </button>
                {openCategory === cat.labelKey && (
                  <div className="pl-4 flex flex-col gap-0.5">
                    {cat.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-2.5 text-sm rounded-lg transition-all ${
                          isActive(link.href)
                            ? "text-primary font-medium bg-primary/8"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-3 mt-3 border-t border-border/30 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle className="shrink-0" />
              </div>
              <Link
                href="/cadastro"
                onClick={() => setMobileOpen(false)}
                className="btn btn-sm btn-outline border-gold/60 text-gold hover:bg-gold hover:text-black hover:border-gold w-full"
              >
                {t("nav.register")}
              </Link>
              <Link
                href="/como-jogar"
                onClick={() => setMobileOpen(false)}
                className="btn btn-sm bg-gold text-black hover:bg-gold/90 border-0 w-full"
              >
                {t("nav.playNow")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
