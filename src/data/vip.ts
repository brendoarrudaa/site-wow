export type VipFeature = {
  feature: string;
  free: string | boolean;
  vip: string | boolean;
};

export const vipFeatures: VipFeature[] = [
  { feature: "Acesso completo ao servidor", free: true, vip: true },
  { feature: "Todas as raids, dungeons e BGs", free: true, vip: true },
  { feature: "Prioridade na fila de login", free: false, vip: true },
  { feature: "Slots de personagem", free: "10 slots", vip: "16 slots" },
  { feature: "Montarias e títulos cosméticos", free: false, vip: true },
  { feature: "Suporte prioritário no Discord", free: false, vip: true },
  { feature: "Teleport para capitais", free: false, vip: "Cooldown 1h" },
  { feature: "Acesso antecipado a eventos", free: false, vip: true },
  { feature: "Badge exclusiva no Discord", free: false, vip: true },
  { feature: "Reparo de equipamento em campo", free: false, vip: "Cooldown 30min" },
];

export const vipBenefits = [
  {
    title: "Conveniência",
    description: "Teleports, reparos e atalhos que economizam tempo real sem tocar no equilíbrio do jogo.",
  },
  {
    title: "Identidade",
    description: "Montarias, títulos e badges que mostram que você faz parte da construção do projeto.",
  },
  {
    title: "Prioridade",
    description: "Fila preferencial em horários de pico e canal de suporte dedicado para resolver problemas mais rápido.",
  },
  {
    title: "Impacto Direto",
    description: "Cada contribuição VIP financia infraestrutura, correções e novos conteúdos. O servidor cresce com você.",
  },
];
