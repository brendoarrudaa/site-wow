import { useState } from "react";
import { CheckCircle } from "lucide-react";

const areas = [
  "Quest",
  "Dungeon",
  "Raid",
  "PvP / Arena",
  "Spell / Talent",
  "NPC",
  "Item",
  "Interface",
  "Outro",
];

const BugReportForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [area, setArea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card-fantasy p-8 text-center">
        <CheckCircle className="h-12 w-12 text-online mx-auto mb-4" />
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">Bug Reportado!</h3>
        <p className="text-muted-foreground">
          Obrigado por ajudar a melhorar o servidor. A equipe irá investigar o problema.
        </p>
        <button className="btn btn-outline border-gold text-gold hover:bg-gold hover:text-black hover:border-gold mt-6" onClick={() => setSubmitted(false)}>
          Reportar Outro
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-fantasy p-6 md:p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Área Afetada *</label>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArea(a)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                area === a
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Descrição do Bug *</label>
        <textarea className="textarea textarea-bordered w-full" placeholder="Descreva o bug com o máximo de detalhes..." rows={4} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Passos para Reproduzir *</label>
        <textarea className="textarea textarea-bordered w-full" placeholder="1. Vá até...\n2. Use a spell...\n3. Observe que..." rows={4} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Personagem (opcional)</label>
          <input className="input input-bordered w-full" placeholder="Nome do personagem" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Print / Link (opcional)</label>
          <input className="input input-bordered w-full" placeholder="URL do print ou vídeo" />
        </div>
      </div>

      <button type="submit" className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full">
        Enviar Report
      </button>
    </form>
  );
};

export default BugReportForm;
