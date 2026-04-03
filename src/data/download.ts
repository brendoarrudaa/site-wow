export const downloadLinks = [
  {
    label: "Cliente Completo (Torrent)",
    size: "~15 GB",
    description: "A forma mais rápida e estável. Ideal para quem já usa torrent.",
    url: "#",
    type: "torrent" as const,
  },
  {
    label: "Cliente Completo (Google Drive)",
    size: "~15 GB",
    description: "Download direto via Google Drive. Pode ser necessário copiar para seu Drive pessoal.",
    url: "#",
    type: "direct" as const,
  },
  {
    label: "Cliente Completo (MEGA)",
    size: "~15 GB",
    description: "Alternativa via MEGA. Velocidade pode variar conforme horário.",
    url: "#",
    type: "direct" as const,
  },
];

export const systemRequirements = {
  minimum: [
    { spec: "Sistema Operacional", value: "Windows 7 / 10 / 11" },
    { spec: "Processador", value: "Intel Core 2 Duo ou equivalente" },
    { spec: "Memória RAM", value: "2 GB" },
    { spec: "Placa de Vídeo", value: "256 MB VRAM (Shader Model 2.0)" },
    { spec: "Armazenamento", value: "20 GB livres" },
    { spec: "Internet", value: "Banda larga" },
  ],
  recommended: [
    { spec: "Sistema Operacional", value: "Windows 10 / 11" },
    { spec: "Processador", value: "Intel Core i3 ou superior" },
    { spec: "Memória RAM", value: "4 GB+" },
    { spec: "Placa de Vídeo", value: "1 GB VRAM" },
    { spec: "Armazenamento", value: "25 GB livres (SSD recomendado)" },
    { spec: "Internet", value: "Banda larga estável" },
  ],
};
