import Link from "next/link";
import { siteConfig, navLinks, navMoreLinks } from "@/data/site-config";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-linear-to-b from-card/50 to-background">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-gold-light via-gold to-accent flex items-center justify-center shadow-md shadow-gold/15">
                <span className="font-serif text-sm font-bold text-primary-foreground">RS</span>
              </div>
              <span className="font-serif text-lg font-bold text-foreground tracking-wide">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-xs font-semibold text-foreground uppercase tracking-[0.15em] mb-5">Navegação</h4>
            <div className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xs font-semibold text-foreground uppercase tracking-[0.15em] mb-5">Comunidade</h4>
            <div className="flex flex-col gap-2.5">
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Discord
              </a>
              {navMoreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="section-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} {siteConfig.name}. Projeto da comunidade. Não afiliado à Blizzard Entertainment.
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
