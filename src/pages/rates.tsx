import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import CTASection from "@/components/CTASection";
import { rates } from "@/data/rates";
import { Crown } from "lucide-react";

const RatesPage = () => {
  return (
    <Layout>
      <SEO
        title="Rates do Servidor"
        description="Rates do Realm of Shadows: 10x XP, 5x Gold e Drop, 1x Legendary. Cada taxa foi escolhida para equilibrar agilidade no leveling e mérito no endgame."
        path="/rates"
      />
      <PageHeader
        title="Rates do Servidor"
        subtitle="Cada taxa foi escolhida com propósito. Leveling ágil, endgame merecido, lendários intocados."
      />

      <section className="page-section">
        <div className="page-container max-w-3xl">
          <div className="card-fantasy overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-4 px-6 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-[0.15em]">Categoria</th>
                  <th className="text-right py-4 px-6 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-[0.15em]">Rate</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => {
                  const Icon = rate.icon;
                  const isBlizzlike = rate.rate === "1x";
                  return (
                    <tr key={rate.category} className={`border-b border-border/20 transition-colors hover:bg-muted/20 ${isBlizzlike ? "bg-gold/3" : ""}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isBlizzlike ? "bg-gold/10" : "bg-primary/8"}`}>
                            <Icon className={`h-4 w-4 ${isBlizzlike ? "text-gold" : "text-primary"} shrink-0`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{rate.category}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rate.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`text-xl font-bold font-serif ${isBlizzlike ? "text-gold" : "text-primary"}`}>{rate.rate}</span>
                        {isBlizzlike && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded-full">Blizzlike</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-12 card-fantasy p-8 flex gap-5 items-start">
            <div className="h-11 w-11 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-foreground mb-3">A Filosofia por Trás dos Números</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O Realm of Shadows foi pensado para quem quer chegar ao endgame sem semanas de grind,
                mas sem pular o mérito. O leveling acelerado coloca você nas raids rapidamente, enquanto
                itens lendários como <strong className="text-foreground">Shadowmourne</strong> e{" "}
                <strong className="text-foreground">Val&apos;anyr</strong> mantêm rates 1x — são conquistas
                que devem ser celebradas, não compradas. Profissões, PvP e reputação em 5x garantem
                que todo o conteúdo seja acessível sem grind excessivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Rates aprovadas?"
        subtitle="Baixe o cliente, configure o realmlist e entre em Northrend."
        primaryLabel="Como Jogar"
        primaryHref="/como-jogar"
        secondaryLabel="Baixar Cliente"
        secondaryHref="/download"
      />
    </Layout>
  );
};

export default RatesPage;
