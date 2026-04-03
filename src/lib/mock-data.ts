export type CharacterClass =
  | "Death Knight"
  | "Druid"
  | "Hunter"
  | "Mage"
  | "Paladin"
  | "Priest"
  | "Rogue"
  | "Shaman"
  | "Warlock"
  | "Warrior"

export const classColors: Record<CharacterClass, string> = {
  "Death Knight": "text-red-500",
  Druid: "text-orange-400",
  Hunter: "text-green-400",
  Mage: "text-cyan-400",
  Paladin: "text-pink-400",
  Priest: "text-white",
  Rogue: "text-yellow-400",
  Shaman: "text-blue-400",
  Warlock: "text-purple-400",
  Warrior: "text-amber-600",
}

export interface Character {
  id: string
  name: string
  class: CharacterClass
  race: string
  level: number
  maxLevel: number
  gold: number
  honorableKills: number
  arenaRating2v2: number
  arenaRating3v3: number
  guild?: string
  guildRank?: string
  faction: "Horda" | "Aliança"
  playedTime: string
  achievementPoints: number
}

export interface User {
  id: string
  username: string
  email: string
  donationPoints: number
  votePoints: number
  accountCreated: string
  lastLogin: string
  characters: Character[]
}

export interface GuildMember {
  name: string
  class: CharacterClass
  level: number
  rank: string
  lastOnline: string
}

export interface BossKill {
  name: string
  kills: number
}

export interface Guild {
  name: string
  faction: "Horda" | "Aliança"
  level: number
  achievements: number
  members: GuildMember[]
  bossKills: BossKill[]
}

export interface Ticket {
  id: string
  subject: string
  status: "open" | "in-progress" | "closed"
  createdAt: string
  updatedAt: string
}

export interface RankingPlayer {
  position: number
  name: string
  class: CharacterClass
  faction: "Horda" | "Aliança"
  rating: number
  wins: number
  losses: number
  guild?: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  category: "mount" | "pet" | "transmog" | "consumable" | "bag" | "service"
  featured?: boolean
}

export interface ServerStatus {
  online: boolean
  playersOnline: number
  maxPlayers: number
  realmName: string
  uptime: string
  nextMaintenance?: string
}

export const mockUser: User = {
  id: "1",
  username: "Arthas",
  email: "arthas@frostmourne.com",
  donationPoints: 1500,
  votePoints: 42,
  accountCreated: "2023-08-15",
  lastLogin: "2024-01-15",
  characters: [
    {
      id: "1",
      name: "Arthas",
      class: "Death Knight",
      race: "Humano",
      level: 80,
      maxLevel: 80,
      gold: 12500,
      honorableKills: 4820,
      arenaRating2v2: 1850,
      arenaRating3v3: 2100,
      guild: "Scourge",
      guildRank: "Líder",
      faction: "Horda",
      playedTime: "45d 12h 30m",
      achievementPoints: 9450,
    },
    {
      id: "2",
      name: "Jaina",
      class: "Mage",
      race: "Humano",
      level: 72,
      maxLevel: 80,
      gold: 3200,
      honorableKills: 210,
      arenaRating2v2: 0,
      arenaRating3v3: 0,
      guild: "Kirin Tor",
      guildRank: "Membro",
      faction: "Aliança",
      playedTime: "12d 5h 15m",
      achievementPoints: 2100,
    },
  ],
}

export const mockTickets: Ticket[] = [
  { id: "1", subject: "Item não recebido após compra", status: "open", createdAt: "2024-01-10", updatedAt: "2024-01-11" },
  { id: "2", subject: "Bug no dungeon ICC", status: "in-progress", createdAt: "2024-01-08", updatedAt: "2024-01-09" },
  { id: "3", subject: "Problema de login", status: "closed", createdAt: "2024-01-05", updatedAt: "2024-01-06" },
]

export const mockRankingArena: RankingPlayer[] = [
  { position: 1, name: "Shadowblade", class: "Rogue", faction: "Horda", rating: 2450, wins: 312, losses: 89, guild: "Elites" },
  { position: 2, name: "Arthas", class: "Death Knight", faction: "Horda", rating: 2100, wins: 220, losses: 95, guild: "Scourge" },
  { position: 3, name: "Lightwing", class: "Paladin", faction: "Aliança", rating: 2050, wins: 198, losses: 102 },
  { position: 4, name: "Frostnova", class: "Mage", faction: "Aliança", rating: 1980, wins: 175, losses: 110, guild: "Kirin Tor" },
  { position: 5, name: "Stormcaller", class: "Shaman", faction: "Horda", rating: 1920, wins: 160, losses: 120 },
]

export const mockRankingHK: RankingPlayer[] = [
  { position: 1, name: "Bloodthirst", class: "Warrior", faction: "Horda", rating: 98420, wins: 0, losses: 0 },
  { position: 2, name: "Shadowblade", class: "Rogue", faction: "Horda", rating: 84210, wins: 0, losses: 0, guild: "Elites" },
  { position: 3, name: "Arthas", class: "Death Knight", faction: "Horda", rating: 4820, wins: 0, losses: 0, guild: "Scourge" },
  { position: 4, name: "Lightwing", class: "Paladin", faction: "Aliança", rating: 3100, wins: 0, losses: 0 },
  { position: 5, name: "Frostnova", class: "Mage", faction: "Aliança", rating: 2980, wins: 0, losses: 0, guild: "Kirin Tor" },
]

export const mockShopItems: ShopItem[] = [
  {
    id: "1",
    name: "Invocador do Inferno",
    description: "Uma montaria demoníaca que deixa rastros de fogo por onde passa.",
    price: 500,
    currency: "DP",
    rarity: "legendary",
    category: "mount",
    featured: true,
  },
  {
    id: "2",
    name: "Dracozinho Azul",
    description: "Um pequeno dragão azul que te segue fiel.",
    price: 150,
    currency: "DP",
    rarity: "rare",
    category: "pet",
  },
  {
    id: "3",
    name: "Transmog Set Élfico",
    description: "Visual completo inspirado nos elfos noturnos.",
    price: 300,
    currency: "DP",
    rarity: "epic",
    category: "transmog",
    featured: true,
  },
  {
    id: "4",
    name: "Bolsa dos Exploradores",
    description: "Uma bolsa mágica com 36 slots de armazenamento.",
    price: 80,
    currency: "DP",
    rarity: "uncommon",
    category: "bag",
  },
  {
    id: "5",
    name: "Elixir de XP",
    description: "Aumenta o ganho de experiência em 100% por 1 hora.",
    price: 25,
    currency: "VP",
    rarity: "common",
    category: "consumable",
  },
  {
    id: "6",
    name: "Mudança de Faction",
    description: "Mude a facção do seu personagem de Horda para Aliança ou vice-versa.",
    price: 400,
    currency: "DP",
    rarity: "rare",
    category: "service",
  },
]

export const mockServerStatus: ServerStatus = {
  online: true,
  playersOnline: 1247,
  maxPlayers: 3000,
  realmName: "Frostmourne",
  uptime: "14d 6h 22m",
  nextMaintenance: "Quarta-feira, 03:00",
}

export const mockGuild: Guild = {
  name: "Scourge",
  faction: "Horda",
  level: 25,
  achievements: 1250,
  members: [
    { name: "Arthas", class: "Death Knight", level: 80, rank: "Líder", lastOnline: "Online" },
    { name: "Kel'Thuzad", class: "Mage", level: 80, rank: "Oficial", lastOnline: "Online" },
    { name: "Sylvanas", class: "Hunter", level: 80, rank: "Oficial", lastOnline: "Há 1 dia" },
    { name: "Darion", class: "Death Knight", level: 80, rank: "Veterano", lastOnline: "Online" },
    { name: "Thane", class: "Warrior", level: 80, rank: "Membro", lastOnline: "Há 3 dias" },
    { name: "Vrakna", class: "Shaman", level: 78, rank: "Membro", lastOnline: "Há 5 dias" },
  ],
  bossKills: [
    { name: "Lich King 25HC", kills: 42 },
    { name: "Halion 25HC", kills: 28 },
    { name: "Sindragosa 25HC", kills: 55 },
    { name: "Professor Putricide 25HC", kills: 61 },
  ],
}
