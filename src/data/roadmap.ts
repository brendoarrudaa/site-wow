export type RoadmapPhase = {
  title: string
  status: 'completed' | 'current' | 'upcoming'
  date: string
  items: string[]
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    title: 'Fase 1 — Fundação',
    status: 'completed',
    date: 'Jan 2026',
    items: [
      'Core do servidor estável e configurado',
      'Site oficial publicado',
      'Discord da comunidade operacional',
      'Sistema de rates definido e documentado',
      'Testes internos de dungeons, quests e pathfinding'
    ]
  },
  {
    title: 'Fase 2 — Beta Fechado',
    status: 'completed',
    date: 'Mar 2026',
    items: [
      'Testers selecionados pela comunidade',
      'Raids Tier 7 validadas (Naxx, OS, EoE)',
      'Anti-cheat implementado e calibrado',
      'Primeira rodada de bugfixes aplicada',
      'Formulários de bug e sugestão ativos no site'
    ]
  },
  {
    title: 'Fase 3 — Beta Aberto',
    status: 'current',
    date: 'Mai 2026',
    items: [
      'Servidor aberto para todos os jogadores',
      'Ulduar (Tier 8) disponível com hard modes',
      'Eventos de boas-vindas e premiação de early adopters',
      'Sistema VIP ativo',
      'Monitoramento contínuo de estabilidade e performance'
    ]
  },
  {
    title: 'Fase 4 — Lançamento Oficial',
    status: 'upcoming',
    date: 'Jul 2026',
    items: [
      'Lançamento oficial do realm',
      'Trial of the Crusader (Tier 9) liberado',
      'Sistema de ranking e conquistas PvP',
      'Campanhas de divulgação em comunidades WoW',
      'Eventos semanais fixos no calendário'
    ]
  },
  {
    title: 'Fase 5 — Expansão do Projeto',
    status: 'upcoming',
    date: '2026+',
    items: [
      'Icecrown Citadel e Ruby Sanctum',
      'Painel de conta no site com histórico e estatísticas',
      'Armory online com perfil de personagem',
      'Sistema de votação com recompensas in-game',
      'Launcher próprio com patch automático e notícias'
    ]
  }
]
