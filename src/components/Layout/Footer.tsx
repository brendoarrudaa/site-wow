import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { useTranslation } from "@/hooks/useTranslation";

const footerNav = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.howToPlay", href: "/como-jogar" },
  { labelKey: "nav.download", href: "/download" },
  { labelKey: "nav.rates", href: "/rates" },
  { labelKey: "nav.status", href: "/status" },
  { labelKey: "nav.vip", href: "/vip" },
  { labelKey: "nav.roadmap", href: "/roadmap" },
];

const footerCommunity = [
  { labelKey: "nav.blog", href: "/blog" },
  { labelKey: "nav.community", href: "/comunidade" },
  { labelKey: "nav.faq", href: "/faq" },
  { labelKey: "nav.rules", href: "/regras" },
  { labelKey: "nav.suggestions", href: "/sugestoes" },
  { labelKey: "nav.bugs", href: "/bugs" },
];

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/30 bg-linear-to-b from-card/50 to-background">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-gold-light via-gold to-accent flex items-center justify-center shadow-md shadow-gold/15">
                <span className="font-serif text-sm font-bold text-primary-foreground">AL</span>
              </div>
              <span className="font-serif text-lg font-bold text-foreground tracking-wide">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-xs font-semibold text-foreground uppercase tracking-[0.15em] mb-5">
              {t("footer.navigation")}
            </h4>
            <div className="flex flex-col gap-2.5">
              {footerNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xs font-semibold text-foreground uppercase tracking-[0.15em] mb-5">
              {t("footer.community")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Discord
              </a>
              {footerCommunity.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="section-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/70">
            {t("footer.copyright", { year: String(new Date().getFullYear()), name: siteConfig.name })}
          </p>
          <p className="text-xs text-muted-foreground/50">
            {siteConfig.expansion}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
