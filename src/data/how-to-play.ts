import { Download, FileText, UserPlus, Play, MessageCircle, HelpCircle } from "lucide-react";

export const steps = [
  {
    icon: Download,
    step: 1,
    title: "Baixe o Cliente",
    description: "Baixe o WoW 3.3.5a (build 12340) pela página de Download. São aproximadamente 15 GB — escolha torrent para maior velocidade.",
  },
  {
    icon: FileText,
    step: 2,
    title: "Configure o Realmlist",
    description: "Na pasta do WoW, abra Data/realmlist.wtf com qualquer editor de texto e substitua todo o conteúdo por:",
    code: "set realmlist logon.realmofshadows.com",
  },
  {
    icon: UserPlus,
    step: 3,
    title: "Crie sua Conta",
    description: "Abra o WoW.exe e registre-se pela tela de criação de conta. Use um nome e senha que você não vai esquecer.",
  },
  {
    icon: Play,
    step: 4,
    title: "Entre em Azeroth",
    description: "Faça login, escolha seu realm, crie seu personagem e comece. Sua aventura no Azeroth Legacy começa agora.",
  },
  {
    icon: MessageCircle,
    step: 5,
    title: "Junte-se ao Discord",
    description: "Entre no Discord para suporte imediato, recrutamento de guild, eventos e interação com a comunidade.",
  },
  {
    icon: HelpCircle,
    step: 6,
    title: "Precisa de Ajuda?",
    description: "Consulte o FAQ, explore os guias no blog ou peça ajuda no #suporte do Discord. Ninguém joga sozinho aqui.",
  },
];

export const tips = [
  "Addons de 3.3.5a funcionam normalmente. DBM, Recount e Questhelper são os mais recomendados.",
  "Primeira vez no WoW? Comece com Hunter, Paladino ou Death Knight — são classes mais acessíveis para aprender o jogo.",
  "Faça um backup do realmlist.wtf original antes de editar, caso precise reverter.",
  "Se tiver problemas de conexão, tente executar o WoW.exe como administrador.",
  "Use .help no chat do jogo para ver a lista de comandos disponíveis no servidor.",
];
