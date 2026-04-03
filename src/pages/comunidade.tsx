import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import { siteConfig } from "@/data/site-config";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Megaphone, Bug, Shield, Calendar, Swords, Trophy } from "lucide-react";

const communityFeatures = [
  { icon: Megaphone, title: "Anúncios", description: "Updates, manutenções e novidades direto da equipe." },
  { icon: MessageCircle, title: "Suporte", description: "Canal dedicado com resposta real de quem mantém o servidor." },
  { icon: Shield, title: "Sugestões", description: "Sua voz importa. Envie ideias que podem virar realidade." },
  { icon: Bug, title: "Bugs", description: "Reporte problemas e ajude a polir a experiência para todos." },
  { icon: Swords, title: "Guilds", description: "Encontre ou divulgue sua guild para jogadores que levam a sério." },
  { icon: Calendar, title: "Eventos", description: "Competições e eventos da comunidade com premiações." },
  { icon: Users, title: "Grupos", description: "LFG para dungeons, raids e arenas sem depender de chat global." },
  { icon: Trophy, title: "Rankings", description: "Acompanhe os jogadores e guilds que se destacam no servidor." },
];

const Community = () => {
  return (
    <Layout>
      <SEO
        title="Comunidade"
        description="Entre no Discord do Realm of Shadows. Suporte, recrutamento de guilds, eventos, sugestões e tudo que acontece na comunidade."
        path="/comunidade"
      />
      <PageHeader
        title="Comunidade"
        subtitle="O Discord é onde o Realm of Shadows acontece de verdade. Suporte, grupos, eventos e decisões."
      />

      <section className="page-section">
        <div className="page-container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Mais que um chat.{" "}
              <span className="text-gradient-gold">Uma comunidade.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Toda a comunicação oficial acontece no Discord. É onde você encontra suporte, forma grupo,
              recruta para sua guild e tem voz nas decisões do servidor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {communityFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-fantasy-hover p-5 text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-serif font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button variant="frost" size="lg" asChild>
              <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer">
                Entrar no Discord
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Community;
