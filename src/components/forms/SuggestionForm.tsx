import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

const categories = [
  "Gameplay",
  "Interface",
  "Balanceamento",
  "Eventos",
  "Economia",
  "Comunidade",
  "Outro",
];

const SuggestionForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card-fantasy p-8 text-center">
        <CheckCircle className="h-12 w-12 text-online mx-auto mb-4" />
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">Sugestão Enviada!</h3>
        <p className="text-muted-foreground">
          Obrigado pelo seu feedback. A equipe irá analisar sua sugestão.
        </p>
        <button className="btn btn-outline border-gold text-gold hover:bg-gold hover:text-black hover:border-gold mt-6" onClick={() => setSubmitted(false)}>
          Enviar Outra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-fantasy p-6 md:p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Título da Sugestão *</label>
        <Input placeholder="Ex: Adicionar evento semanal de PvP" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                category === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Descrição *</label>
        <Textarea placeholder="Descreva sua sugestão com o máximo de detalhes possível..." rows={5} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Seu Nome (opcional)</label>
          <Input placeholder="Como quer ser chamado" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Discord (opcional)</label>
          <Input placeholder="usuario#1234" />
        </div>
      </div>

      <button type="submit" className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full">
        Enviar Sugestão
      </button>
    </form>
  );
};

export default SuggestionForm;
