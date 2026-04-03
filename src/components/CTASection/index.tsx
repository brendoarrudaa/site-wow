import Link from "next/link";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

const CTASection = ({
  title = "Sua aventura começa com um clique",
  subtitle = "Baixe o cliente, configure o realmlist e entre em Northrend. A comunidade está te esperando.",
  primaryLabel = "Começar a Jogar",
  primaryHref = "/como-jogar",
  secondaryLabel = "Entrar no Discord",
  secondaryHref = "/comunidade",
}: CTASectionProps) => {
  return (
    <section className="page-section relative">
      <div className="absolute inset-0 bg-linear-to-t from-card/40 to-transparent pointer-events-none" />
      <div className="page-container text-center relative">
        <div className="section-divider mb-14" />
        <p className="text-xs font-medium text-primary tracking-[0.2em] uppercase mb-4">Pronto?</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-serif glow-text leading-tight">{title}</h2>
        <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-base">{subtitle}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href={primaryHref} className="btn btn-lg bg-gold text-black hover:bg-gold/90 border-0 text-base px-8 h-12">
            {primaryLabel}
          </Link>
          <Link href={secondaryHref} className="btn btn-lg btn-outline border-gold text-gold hover:bg-gold hover:text-black hover:border-gold text-base px-8 h-12">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
