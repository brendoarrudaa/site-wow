import { MessageCircle, Users, Megaphone, Bug, Shield, Calendar } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Megaphone, label: "Anúncios em primeira mão" },
  { icon: Users, label: "Recrutamento de guilds" },
  { icon: MessageCircle, label: "Suporte direto da equipe" },
  { icon: Bug, label: "Canal de bugs dedicado" },
  { icon: Shield, label: "Voz nas decisões do servidor" },
  { icon: Calendar, label: "Eventos com premiação" },
];

const DiscordSection = () => {
  return (
    <section className="page-section relative">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-card/30 to-transparent pointer-events-none" />
      <div className="page-container relative">
        <div className="card-frost p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-frost/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <p className="text-xs font-medium text-frost tracking-[0.2em] uppercase mb-3">Comunidade</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif mb-4">
              O servidor é nosso.{" "}
              <span className="text-gradient-frost">A comunidade também.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              No Discord do Realm of Shadows você encontra suporte real, jogadores ativos e uma equipe que ouve.
              Não é só um chat — é onde o servidor acontece.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto mb-10">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.label} className="flex items-center gap-2.5 text-sm text-secondary-foreground p-2 rounded-lg hover:bg-frost/5 transition-colors">
                    <Icon className="h-4 w-4 text-frost shrink-0" />
                    <span>{b.label}</span>
                  </div>
                );
              })}
            </div>

            <Button variant="frost" size="lg" className="text-base px-8 h-12" asChild>
              <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer">
                Entrar no Discord
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscordSection;
