import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X, ChevronDown } from "lucide-react";
import { siteConfig, navLinks, navMoreLinks } from "@/data/site-config";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [router.pathname]);

  const isActive = (href: string) => router.pathname === href;

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
            <span className="font-serif text-sm font-bold text-primary-foreground">RS</span>
          </div>
          <span className="font-serif text-lg font-bold text-foreground hidden sm:block tracking-wide">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                isActive(link.href)
                  ? "text-primary font-medium bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-all duration-200 flex items-center gap-1 hover:bg-muted/50"
            >
              Mais <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border/80 bg-card/95 backdrop-blur-xl p-1.5 shadow-xl shadow-background/60 z-50">
                  {navMoreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                        isActive(link.href)
                          ? "text-primary font-medium bg-primary/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/como-jogar" className="btn btn-sm bg-gold text-black hover:bg-gold/90 border-0">
            Jogar Agora
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
          <nav className="page-container py-4 flex flex-col gap-0.5">
            {[...navLinks, ...navMoreLinks].map((link) => (
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
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-border/30 flex items-center gap-2">
              <ThemeToggle className="shrink-0" />
              <Link href="/como-jogar" onClick={() => setMobileOpen(false)} className="btn btn-sm bg-gold text-black hover:bg-gold/90 border-0 flex-1">
                Jogar Agora
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
