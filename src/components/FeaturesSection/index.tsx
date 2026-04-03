import { features } from "@/data/features";

const FeaturesSection = () => {
  return (
    <section className="page-section relative">
      <div className="absolute inset-0 bg-linear-to-b from-card/40 via-transparent to-card/40 pointer-events-none" />
      <div className="page-container relative">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-primary tracking-[0.2em] uppercase mb-3">Diferenciais</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            O que faz o{" "}
            <span className="text-gradient-gold">Realm of Shadows</span>{" "}
            diferente
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            Não é promessa — é como o servidor funciona hoje. Qualidade que você sente desde o primeiro login.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card-fantasy-hover p-6 group">
                <div className="h-11 w-11 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-5 group-hover:from-primary/25 group-hover:to-primary/10 transition-all">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-serif font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
