import { Wifi, WifiOff, Wrench, Users } from "lucide-react";
import { mockServerStatus } from "@/data/server-status";

const statusConfig = {
  online: { label: "Online", color: "text-online", icon: Wifi, dotColor: "bg-online" },
  offline: { label: "Offline", color: "text-offline", icon: WifiOff, dotColor: "bg-offline" },
  maintenance: { label: "Manutenção", color: "text-gold", icon: Wrench, dotColor: "bg-gold" },
};

const ServerStatusSection = () => {
  const status = mockServerStatus;
  const config = statusConfig[status.status];
  const StatusIcon = config.icon;
  const populationPercent = Math.round((status.population / status.maxPopulation) * 100);

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="card-fantasy p-8 md:p-10 max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-medium text-primary tracking-[0.2em] uppercase mb-1">Realm Status</p>
                <h2 className="text-2xl font-serif font-bold text-foreground">Status do Servidor</h2>
              </div>
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border ${
                status.status === "online" ? "border-online/20 bg-online/5" :
                status.status === "offline" ? "border-offline/20 bg-offline/5" : "border-gold/20 bg-gold/5"
              }`}>
                <span className={`h-2 w-2 rounded-full ${config.dotColor} animate-pulse-glow`} />
                <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Realm", value: status.name },
                { label: "Tipo", value: status.type },
                { label: "Jogadores", value: status.population.toString(), icon: Users },
                { label: "Uptime", value: status.uptime },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium">{item.label}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2.5">
                <span className="font-medium">Capacidade do Servidor</span>
                <span className="font-semibold text-foreground">{populationPercent}%</span>
              </div>
              <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-gold via-gold to-accent rounded-full transition-all duration-700 relative"
                  style={{ width: `${populationPercent}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent to-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServerStatusSection;
