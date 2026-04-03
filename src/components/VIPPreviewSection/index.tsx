import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";

const VIPPreviewSection = () => {
  return (
    <section className="page-section">
      <div className="page-container">
        <div className="card-fantasy p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="shrink-0">
              <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-gold-light via-gold to-accent flex items-center justify-center shadow-lg shadow-gold/20 relative">
                <Crown className="h-9 w-9 text-primary-foreground" />
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-gold" />
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Apoie quem constrói.{" "}
                <span className="text-gradient-gold">Ganhe estilo.</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg leading-relaxed">
                O VIP é para quem quer contribuir com o projeto e receber conveniências em troca.
                Zero vantagem competitiva — apenas qualidade de vida e cosméticos exclusivos.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-xs text-secondary-foreground">
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-gold" />Fila Prioritária</span>
                <span className="flex items-center gap-1.5"><Crown className="h-3.5 w-3.5 text-gold" />Cosméticos Exclusivos</span>
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-gold" />Suporte Dedicado</span>
              </div>
            </div>
            <Button variant="gold" size="lg" className="shrink-0" asChild>
              <Link href="/vip">Conhecer o VIP</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VIPPreviewSection;
