import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import CTASection from "@/components/CTASection";
import { roadmapPhases } from "@/data/roadmap";
import { CheckCircle, Clock, Circle } from "lucide-react";

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-online", borderColor: "border-online", bg: "bg-online" },
  current: { icon: Clock, color: "text-primary", borderColor: "border-primary", bg: "bg-primary" },
  upcoming: { icon: Circle, color: "text-muted-foreground", borderColor: "border-muted-foreground", bg: "bg-muted-foreground" },
};

const Roadmap = () => {
  return (
    <Layout>
      <SEO
        title="Roadmap"
        description="Acompanhe o progresso do Azeroth Legacy: fases concluídas, fase atual e o que está planejado. Transparência sobre o desenvolvimento do servidor."
        path="/roadmap"
      />
      <PageHeader
        title="Roadmap"
        subtitle="Acompanhe o progresso do servidor e o que está por vir."
      />

      <section className="page-section">
        <div className="page-container max-w-3xl">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 hidden md:block" />

            <div className="space-y-8">
              {roadmapPhases.map((phase) => {
                const config = statusConfig[phase.status];
                const StatusIcon = config.icon;
                return (
                  <div key={phase.title} className="relative flex gap-6">
                    <div className="hidden md:flex shrink-0 w-12 justify-center z-10">
                      <div className={`h-3 w-3 rounded-full mt-6 ${config.bg}`} />
                    </div>
                    <div className={`flex-1 card-fantasy p-6 border-l-2 md:border-l-0 ${config.borderColor}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                        <h3 className="font-serif font-bold text-foreground">{phase.title}</h3>
                        <time className="text-xs text-muted-foreground ml-auto">{phase.date}</time>
                      </div>
                      {phase.status === "current" && (
                        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded mb-3">
                          Fase Atual
                        </span>
                      )}
                      <ul className="space-y-2">
                        {phase.items.map((item, j) => (
                          <li key={j} className="flex gap-2 text-sm text-secondary-foreground">
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${config.bg}`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Roadmap;
