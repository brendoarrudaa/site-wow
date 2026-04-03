import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import { rulesSections } from "@/data/rules";
import { Shield } from "lucide-react";

const Rules = () => {
  return (
    <Layout>
      <SEO
        title="Regras do Servidor"
        description="Regras oficiais do Realm of Shadows: conduta geral, anti-cheat, comércio, PvP e comunicação. Leia antes de jogar."
        path="/regras"
      />
      <PageHeader
        title="Regras do Servidor"
        subtitle="Leia com atenção. O descumprimento pode resultar em punições que variam de aviso a banimento permanente."
      />

      <section className="page-section">
        <div className="page-container max-w-3xl space-y-8">
          {rulesSections.map((section) => (
            <div key={section.title} className="card-fantasy p-6">
              <h2 className="text-xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.rules.map((rule, j) => (
                  <li key={j} className="flex gap-3 text-sm text-secondary-foreground">
                    <span className="text-primary font-bold mt-0.5">§</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card-fantasy p-6 border-gold-glow">
            <p className="text-sm text-muted-foreground text-center">
              As regras podem ser atualizadas a qualquer momento. É responsabilidade do jogador
              manter-se informado. Em caso de dúvidas, procure a equipe no Discord.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rules;
