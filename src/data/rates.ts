import { Sword, ScrollText, Compass, Coins, Package, Crown, Users, Shield, Pickaxe } from "lucide-react";

export const rates = [
  { category: "XP por Monstros", rate: "10x", icon: Sword, description: "Leveling acelerado para focar no endgame" },
  { category: "XP por Quests", rate: "10x", icon: ScrollText, description: "Quests recompensam de forma proporcional" },
  { category: "XP Exploração / Pet / BGs", rate: "5x", icon: Compass, description: "Bônus balanceado para atividades secundárias" },
  { category: "Gold por Monstros", rate: "5x", icon: Coins, description: "Economia ajustada sem inflação" },
  { category: "Drop (Common → Epic)", rate: "5x", icon: Package, description: "Mais drops sem quebrar a progressão" },
  { category: "Legendary & Artifact", rate: "1x", icon: Crown, description: "100% Blizzlike — conquiste de verdade" },
  { category: "Reputação & BGs", rate: "5x", icon: Users, description: "Progresso social acelerado" },
  { category: "Honor PvP", rate: "5x", icon: Shield, description: "PvP recompensador desde o início" },
  { category: "Profissões", rate: "5x", icon: Pickaxe, description: "Craft e gathering mais rápidos" },
];
