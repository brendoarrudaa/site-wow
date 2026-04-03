import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import CTASection from "@/components/CTASection";
import { steps, tips } from "@/data/how-to-play";
import { Lightbulb } from "lucide-react";

const HowToPlay = () => {
  return (
    <Layout>
      <SEO
        title="Como Jogar"
        description="Passo a passo para conectar no Azeroth Legacy. Baixe o cliente WoW 3.3.5a, configure o realmlist e entre no servidor em minutos."
        path="/como-jogar"
      />
      <PageHeader
        title="Como Jogar"
        subtitle="Do zero ao login em poucos minutos. Siga o passo a passo e entre no Azeroth Legacy."
      />

      <section className="page-section">
        <div className="page-container max-w-3xl">
          <div className="space-y-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="card-fantasy p-6 flex gap-5">
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Passo {s.step}
                      </span>
                      <h3 className="font-serif font-semibold text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    {s.code && (
                      <code className="mt-3 block bg-muted px-4 py-2 rounded text-sm text-primary font-mono">
                        {s.code}
                      </code>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              Dicas para Aproveitar Melhor
            </h2>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="card-fantasy p-4 flex gap-3 items-start">
                  <span className="text-primary font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-secondary-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Tudo configurado?"
        subtitle="Baixe o cliente e entre no servidor agora."
        primaryLabel="Baixar Cliente"
        primaryHref="/download"
        secondaryLabel="Ver Rates"
        secondaryHref="/rates"
      />
    </Layout>
  );
};

export default HowToPlay;
