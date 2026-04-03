import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        <Button variant="outline-gold" className="mt-6" onClick={() => setSubmitted(false)}>
          Reportar Outro
        </Button>
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
        <Textarea placeholder="Descreva o bug com o máximo de detalhes..." rows={4} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Passos para Reproduzir *</label>
        <Textarea placeholder="1. Vá até...\n2. Use a spell...\n3. Observe que..." rows={4} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Personagem (opcional)</label>
          <Input placeholder="Nome do personagem" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Print / Link (opcional)</label>
          <Input placeholder="URL do print ou vídeo" />
        </div>
      </div>

      <Button type="submit" variant="gold" className="w-full">
        Enviar Report
      </Button>
    </form>
  );
};

export default BugReportForm;
