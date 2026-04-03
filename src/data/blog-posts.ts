export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  coverColor: string
  content: string
  recommended?: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'bem-vindo-ao-realm-of-shadows',
    title: 'Realm of Shadows: O Servidor Que a Comunidade Merece',
    excerpt:
      'Conheça o projeto que está trazendo WotLK de volta com qualidade, dedicação e respeito pelo jogo. Saiba o que esperar e como participar desde o início.',
    date: '2026-05-01',
    category: 'Anúncio',
    coverColor: 'from-gold/20 to-accent/10',
    content: `<h2>Um servidor construído com propósito</h2>
<p>O <strong>Realm of Shadows</strong> não é mais um servidor genérico. Nasceu da frustração com projetos instáveis, abandonados ou pay-to-win — e da certeza de que a comunidade brasileira de WotLK merece algo melhor.</p>
<h3>O que nos diferencia</h3>
<ul>
<li><strong>Scripts Blizzlike</strong> — raids, dungeons e quests funcionando como a Blizzard projetou</li>
<li><strong>Rates com propósito</strong> — leveling acelerado, endgame merecido, lendários 1x</li>
<li><strong>Anti-cheat ativo</strong> — quem joga limpo não precisa se preocupar</li>
<li><strong>Equipe presente</strong> — bugfixes semanais, comunicação transparente, decisões com a comunidade</li>
</ul>
<h3>Como participar</h3>
<p>Estamos em <strong>Beta Aberto</strong>. Acesse a página <a href="/como-jogar">Como Jogar</a>, baixe o cliente e entre. Seu feedback agora molda o servidor que vai ao ar oficialmente.</p>
<p>Nos vemos em Northrend. ⚔️</p>`,
    recommended: ['rates-explicadas', 'guia-rapido-novos-jogadores']
  },
  {
    slug: 'como-conectar-no-servidor',
    title: 'Do Download ao Login: Como Conectar em 5 Minutos',
    excerpt:
      'Guia direto ao ponto para baixar o cliente, configurar o realmlist e entrar no Realm of Shadows sem complicação.',
    date: '2026-05-02',
    category: 'Guia',
    coverColor: 'from-frost/20 to-frost-dark/10',
    content: `<h2>Conecte-se em minutos</h2>
<h3>1. Baixe o cliente 3.3.5a</h3>
<p>Você precisa do WoW versão <strong>3.3.5a (build 12340)</strong>. Na página de <a href="/download">Download</a> você encontra links verificados via torrent, Google Drive e MEGA.</p>
<h3>2. Configure o realmlist</h3>
<p>Abra a pasta do WoW → <code>Data</code> → <code>realmlist.wtf</code> com qualquer editor de texto. Substitua tudo por:</p>
<p><code>set realmlist logon.realmofshadows.com</code></p>
<h3>3. Crie sua conta</h3>
<p>Abra o WoW.exe e use a tela de criação de conta. Escolha nome e senha seguros — você vai precisar deles.</p>
<h3>4. Jogue</h3>
<p>Login, personagem, aventura. Recomendamos entrar no <a href="/comunidade">Discord</a> para suporte e para encontrar grupo.</p>`,
    recommended: [
      'bem-vindo-ao-realm-of-shadows',
      'guia-rapido-novos-jogadores'
    ]
  },
  {
    slug: 'rates-explicadas',
    title: 'Por Que Essas Rates? A Filosofia por Trás dos Números',
    excerpt:
      'Entenda como cada taxa foi escolhida para equilibrar agilidade no leveling, mérito no endgame e respeito pela progressão original.',
    date: '2026-05-03',
    category: 'Info',
    coverColor: 'from-gold/20 to-gold-dark/10',
    content: `<h2>Rates não são arbitrárias</h2>
<p>No Realm of Shadows, cada taxa foi calibrada com um princípio: <strong>agilidade sem trivializar</strong>. Queremos que você chegue ao conteúdo que importa sem semanas de grind, mas que cada conquista significativa exija esforço real.</p>
<h3>XP e Leveling — 10x / 5x</h3>
<p>Com 10x de XP, o caminho de 1 a 80 leva entre 15 e 20 horas para jogadores experientes. Exploração e BGs com 5x mantêm relevância sem virar obrigação.</p>
<h3>Drop e Gold — 5x</h3>
<p>Drops acelerados encurtam a preparação para heroics e raids. Gold 5x mantém a economia funcional sem inflação descontrolada.</p>
<h3>Legendary & Artifact — 1x</h3>
<p><strong>Shadowmourne</strong>, <strong>Val'anyr</strong> e todos os lendários mantêm taxa 1x. São conquistas de verdade — não atalhos.</p>
<h3>Profissões e PvP — 5x</h3>
<p>Profissões em 5x permitem contribuir para o grupo rapidamente. Honor 5x garante que PvP seja recompensador desde a primeira battleground.</p>`,
    recommended: ['bem-vindo-ao-realm-of-shadows', 'roadmap-do-beta']
  },
  {
    slug: 'roadmap-do-beta',
    title: 'Roadmap: De Onde Viemos e Para Onde Vamos',
    excerpt:
      'O que já foi entregue, o que está no ar agora e o que está planejado para os próximos meses do Realm of Shadows.',
    date: '2026-05-05',
    category: 'Anúncio',
    coverColor: 'from-frost/20 to-gold/10',
    content: `<h2>Transparência sobre o progresso</h2>
<p>Desde janeiro de 2026, cada fase do projeto foi planejada e executada com foco em estabilidade e qualidade. Veja onde estamos.</p>
<h3>✅ Fase 1 — Fundação (Jan 2026)</h3>
<p>Core estável, site publicado, Discord operacional, sistema de rates definido e testes internos de dungeons concluídos.</p>
<h3>✅ Fase 2 — Beta Fechado (Mar 2026)</h3>
<p>Testers selecionados, raids Tier 7 validadas, anti-cheat calibrado, primeira rodada de bugfixes e formulários ativos no site.</p>
<h3>🔥 Fase 3 — Beta Aberto (Agora)</h3>
<p>Servidor aberto para todos. Ulduar com hard modes, eventos de boas-vindas, VIP ativo e monitoramento contínuo.</p>
<h3>🎯 Fase 4 — Lançamento (Jul 2026)</h3>
<p>Trial of the Crusader, rankings PvP, campanhas de divulgação e eventos semanais fixos.</p>
<h3>🚀 Fase 5 — Expansão (2026+)</h3>
<p>ICC, Ruby Sanctum, painel de conta, armory online e launcher próprio no horizonte.</p>
<p>Detalhes completos na página de <a href="/roadmap">Roadmap</a>.</p>`,
    recommended: ['bem-vindo-ao-realm-of-shadows', 'changelog-inicial']
  },
  {
    slug: 'changelog-inicial',
    title: 'Changelog v1.0 — O Que Mudou na Build de Lançamento',
    excerpt:
      'Todas as correções, melhorias e novidades aplicadas na primeira build pública do Beta Aberto.',
    date: '2026-05-06',
    category: 'Changelog',
    coverColor: 'from-success/20 to-frost-dark/10',
    content: `<h2>Changelog — Beta Aberto v1.0</h2>
<h3>🧠 Correções</h3>
<ul>
<li>Pathfinding de NPCs em Borean Tundra corrigido</li>
<li>Loot de trash mobs em Naxxramas ajustado</li>
<li>Respawn de rare mobs em Storm Peaks normalizado</li>
<li>Quest chains de Icecrown completáveis do início ao fim</li>
<li>Cálculo de honor em Wintergrasp recalibrado</li>
</ul>
<h3>⚡ Melhorias</h3>
<ul>
<li>Core otimizado para suportar 300+ jogadores simultâneos</li>
<li>Anti-cheat atualizado com novas detecções</li>
<li>Site redesenhado com melhor performance e navegação</li>
<li>Novos comandos de GM para suporte mais ágil</li>
</ul>
<h3>🎉 Novidades</h3>
<ul>
<li>Sistema VIP implementado e documentado</li>
<li>Formulários de bug e sugestão ativos no site</li>
<li>Blog com notícias, guias e changelogs</li>
<li>Página de status do servidor em tempo real</li>
</ul>`,
    recommended: ['roadmap-do-beta', 'rates-explicadas']
  },
  {
    slug: 'guia-rapido-novos-jogadores',
    title: 'Primeiro Dia no Realm of Shadows: Guia para Novatos',
    excerpt:
      'Nunca jogou WoW ou nunca entrou em private server? Este guia cobre tudo que você precisa para começar do zero.',
    date: '2026-05-07',
    category: 'Guia',
    coverColor: 'from-gold-light/20 to-gold/10',
    content: `<h2>Bem-vindo, aventureiro</h2>
<p>Se essa é sua primeira vez em um servidor privado — ou até sua primeira vez em WoW — relaxa. Este guia existe para que ninguém fique perdido.</p>
<h3>1. O que é um private server?</h3>
<p>É um servidor não-oficial mantido pela comunidade. O Realm of Shadows roda <strong>Wrath of the Lich King (3.3.5a)</strong>, a expansão considerada o auge do WoW por milhões de jogadores.</p>
<h3>2. Preciso pagar?</h3>
<p>Não. Jogar é 100% gratuito. O VIP existe para quem quer apoiar o projeto — e não vende nenhuma vantagem competitiva.</p>
<h3>3. Como começo?</h3>
<ol>
<li><a href="/download">Baixe o cliente</a> — são ~15 GB</li>
<li>Configure o <code>realmlist.wtf</code> seguindo o guia <a href="/como-jogar">Como Jogar</a></li>
<li>Crie sua conta e seu personagem</li>
<li>Entre no <a href="/comunidade">Discord</a> para suporte e grupo</li>
</ol>
<h3>4. Qual classe escolher?</h3>
<p>WotLK tem 10 classes. Para começar, as mais acessíveis são <strong>Paladino</strong> (versátil), <strong>Hunter</strong> (direto ao ponto) e <strong>Death Knight</strong> (começa no nível 55).</p>
<h3>5. Dicas que fazem diferença</h3>
<ul>
<li>Instale <strong>DBM</strong>, <strong>Recount</strong> e <strong>Questhelper</strong> — são essenciais</li>
<li>Faça dungeons durante o leveling para equipar mais rápido</li>
<li>Pergunte sem medo no chat ou no Discord — a comunidade ajuda</li>
<li>Leia as <a href="/regras">Regras</a> para jogar sem surpresas</li>
</ul>
<p>O Realm of Shadows foi feito para jogadores como você. Bem-vindo. 🛡️</p>`,
    recommended: ['como-conectar-no-servidor', 'rates-explicadas']
  }
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}
