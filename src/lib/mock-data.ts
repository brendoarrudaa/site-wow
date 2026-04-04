type CharacterClass =
  | 'Death Knight'
  | 'Druid'
  | 'Hunter'
  | 'Mage'
  | 'Paladin'
  | 'Priest'
  | 'Rogue'
  | 'Shaman'
  | 'Warlock'
  | 'Warrior'

export const classColors: Record<CharacterClass, string> = {
  'Death Knight': 'text-red-500',
  Druid: 'text-orange-400',
  Hunter: 'text-green-400',
  Mage: 'text-cyan-400',
  Paladin: 'text-pink-400',
  Priest: 'text-white',
  Rogue: 'text-yellow-400',
  Shaman: 'text-blue-400',
  Warlock: 'text-purple-400',
  Warrior: 'text-amber-600'
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
  faction: 'Horda' | 'Aliança'
  playedTime: string
  achievementPoints: number
}

interface User {
  id: string
  username: string
  email: string
  donationPoints: number
  votePoints: number
  accountCreated: string
  lastLogin: string
  characters: Character[]
}

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: 'mount' | 'pet' | 'transmog' | 'consumable' | 'bag' | 'service'
  featured?: boolean
}

export const mockUser: User = {
  id: '1',
  username: 'Arthas',
  email: 'arthas@frostmourne.com',
  donationPoints: 1500,
  votePoints: 42,
  accountCreated: '2023-08-15',
  lastLogin: '2024-01-15',
  characters: [
    {
      id: '1',
      name: 'Arthas',
      class: 'Death Knight',
      race: 'Humano',
      level: 80,
      maxLevel: 80,
      gold: 12500,
      honorableKills: 4820,
      arenaRating2v2: 1850,
      arenaRating3v3: 2100,
      guild: 'Scourge',
      guildRank: 'Líder',
      faction: 'Horda',
      playedTime: '45d 12h 30m',
      achievementPoints: 9450
    },
    {
      id: '2',
      name: 'Jaina',
      class: 'Mage',
      race: 'Humano',
      level: 72,
      maxLevel: 80,
      gold: 3200,
      honorableKills: 210,
      arenaRating2v2: 0,
      arenaRating3v3: 0,
      guild: 'Kirin Tor',
      guildRank: 'Membro',
      faction: 'Aliança',
      playedTime: '12d 5h 15m',
      achievementPoints: 2100
    }
  ]
}

export const mockShopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Invocador do Inferno',
    description:
      'Uma montaria demoníaca que deixa rastros de fogo por onde passa.',
    price: 500,
    currency: 'DP',
    rarity: 'legendary',
    category: 'mount',
    featured: true
  },
  {
    id: '2',
    name: 'Dracozinho Azul',
    description: 'Um pequeno dragão azul que te segue fiel.',
    price: 150,
    currency: 'DP',
    rarity: 'rare',
    category: 'pet'
  },
  {
    id: '3',
    name: 'Transmog Set Élfico',
    description: 'Visual completo inspirado nos elfos noturnos.',
    price: 300,
    currency: 'DP',
    rarity: 'epic',
    category: 'transmog',
    featured: true
  },
  {
    id: '4',
    name: 'Bolsa dos Exploradores',
    description: 'Uma bolsa mágica com 36 slots de armazenamento.',
    price: 80,
    currency: 'DP',
    rarity: 'uncommon',
    category: 'bag'
  },
  {
    id: '5',
    name: 'Elixir de XP',
    description: 'Aumenta o ganho de experiência em 100% por 1 hora.',
    price: 25,
    currency: 'VP',
    rarity: 'common',
    category: 'consumable'
  },
  {
    id: '6',
    name: 'Mudança de Faction',
    description:
      'Mude a facção do seu personagem de Horda para Aliança ou vice-versa.',
    price: 400,
    currency: 'DP',
    rarity: 'rare',
    category: 'service'
  }
]
