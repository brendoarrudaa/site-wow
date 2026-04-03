import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import CTASection from "@/components/CTASection";
import { downloadLinks, systemRequirements } from "@/data/download";
import { siteConfig } from "@/data/site-config";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon, Monitor, FileText } from "lucide-react";

const DownloadPage = () => {
  return (
    <Layout>
      <SEO
        title="Download"
        description="Baixe o cliente WoW 3.3.5a para jogar no Realm of Shadows. Links verificados via torrent, Google Drive e MEGA."
        path="/download"
      />
      <PageHeader
        title="Download"
        subtitle="Tudo que você precisa para entrar no Realm of Shadows. Cliente, realmlist e instruções."
      />

      <section className="page-section">
        <div className="page-container max-w-4xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Cliente WoW 3.3.5a</h2>
          <div className="grid gap-4">
            {downloadLinks.map((link) => (
              <div key={link.label} className="card-fantasy p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DownloadIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{link.label}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{link.size}</span>
                  <Button variant="outline-gold" size="sm" asChild>
                    <a href={link.url}>Baixar</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 card-fantasy p-5">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Configuração do Realmlist</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Após instalar o cliente, abra{" "}
              <code className="bg-muted px-2 py-0.5 rounded text-primary font-mono">Data/realmlist.wtf</code>{" "}
              e substitua o conteúdo por:
            </p>
            <code className="block bg-muted px-4 py-3 rounded text-primary font-mono text-sm">
              {siteConfig.realmlist}
            </code>
          </div>

          <div className="mt-8 card-fantasy p-5">
            <div className="flex items-center gap-3 mb-3">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Launcher Próprio — Em Breve</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Estamos desenvolvendo um launcher dedicado com patch automático, realmlist pré-configurado
              e notícias do servidor. Acompanhe pelo Discord.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Requisitos do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["minimum", "recommended"] as const).map((type) => (
                <div key={type} className="card-fantasy p-5">
                  <h3 className="font-serif font-semibold text-foreground mb-4">
                    {type === "minimum" ? "Mínimos" : "Recomendados"}
                  </h3>
                  <div className="space-y-3">
                    {systemRequirements[type].map((req) => (
                      <div key={req.spec} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{req.spec}</span>
                        <span className="text-foreground font-medium">{req.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Cliente pronto?"
        subtitle="Veja o passo a passo completo para se conectar ao servidor."
        primaryLabel="Como Jogar"
        primaryHref="/como-jogar"
        secondaryLabel="Entrar no Discord"
        secondaryHref="/comunidade"
      />
    </Layout>
  );
};

export default DownloadPage;
