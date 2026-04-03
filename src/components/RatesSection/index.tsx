import { rates } from "@/data/rates";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RatesSection = () => {
  return (
    <section className="page-section">
      <div className="page-container">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-primary tracking-[0.2em] uppercase mb-3">Configuração</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Rates com <span className="text-gradient-gold">Propósito</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Leveling rápido para chegar ao que importa. Lendários 1x para manter o mérito. Cada número tem uma razão.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rates.map((rate) => {
            const Icon = rate.icon;
            const isBlizzlike = rate.rate === "1x";
            return (
              <div
                key={rate.category}
                className={`card-fantasy-hover p-5 flex items-start gap-4 ${isBlizzlike ? "border-gold/20" : ""}`}
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                  isBlizzlike
                    ? "bg-gradient-to-br from-gold/20 to-gold/5"
                    : "bg-gradient-to-br from-primary/12 to-primary/4"
                }`}>
                  <Icon className={`h-5 w-5 ${isBlizzlike ? "text-gold" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground">{rate.category}</h3>
                    <span className={`text-xl font-bold font-serif ${isBlizzlike ? "text-gold" : "text-primary"}`}>
                      {rate.rate}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{rate.description}</p>
                  {isBlizzlike && (
                    <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                      Blizzlike
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline-gold" asChild>
            <Link to="/rates">Ver Detalhes das Rates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RatesSection;
