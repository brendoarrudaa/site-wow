import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import CTASection from "@/components/CTASection";
import { vipFeatures, vipBenefits } from "@/data/vip";
import { Crown, Check, X } from "lucide-react";

const VIP = () => {
  return (
    <Layout>
      <SEO
        title="VIP — Apoie o Projeto"
        description="O VIP do Azeroth Legacy oferece conveniências e cosméticos exclusivos. Sem pay-to-win. Apoie o projeto e ganhe benefícios de qualidade de vida."
        path="/vip"
      />
      <PageHeader
        title="VIP — Apoie o Projeto"
        subtitle="Conveniência e cosméticos para quem quer contribuir. Sem pay-to-win. Sem exceções."
      />

      <section className="page-section">
        <div className="page-container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-linear-to-br from-gold to-accent items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">
              O que é o <span className="text-gradient-gold">VIP</span>?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              O VIP é a forma de sustentar o Azeroth Legacy. Em troca, você ganha atalhos de qualidade de vida
              e itens cosméticos exclusivos. O que o VIP não dá: gear, stats, drop bonus ou qualquer vantagem em combat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {vipBenefits.map((b) => (
              <div key={b.title} className="card-fantasy p-6">
                <h3 className="font-serif font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">
            Free vs VIP — Sem Pegadinha
          </h2>
          <div className="card-fantasy overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left py-3 px-5 text-sm font-serif font-semibold text-foreground">Benefício</th>
                    <th className="text-center py-3 px-5 text-sm font-serif font-semibold text-foreground">Free</th>
                    <th className="text-center py-3 px-5 text-sm font-serif font-semibold text-primary">VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {vipFeatures.map((f, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-3 px-5 text-sm text-foreground">{f.feature}</td>
                      <td className="py-3 px-5 text-center">
                        {typeof f.free === "boolean" ? (
                          f.free ? <Check className="h-4 w-4 text-online mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{f.free}</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-center">
                        {typeof f.vip === "boolean" ? (
                          f.vip ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-sm text-primary font-medium">{f.vip}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Benefícios e valores podem ser ajustados conforme o servidor evolui. Sempre com transparência.
          </p>
        </div>
      </section>

      <CTASection
        title="Quer fazer parte da construção?"
        subtitle="O VIP será ativado em breve. Acompanhe pelo Discord para ser o primeiro a saber."
        primaryLabel="Entrar no Discord"
        primaryHref="/comunidade"
        secondaryLabel="Ver Roadmap"
        secondaryHref="/roadmap"
      />
    </Layout>
  );
};

export default VIP;
