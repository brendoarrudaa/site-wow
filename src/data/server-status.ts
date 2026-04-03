export type RealmStatus = {
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  population: number;
  maxPopulation: number;
  uptime: string;
};

export const mockServerStatus: RealmStatus = {
  name: "Azeroth Legacy",
  type: "PvP",
  status: "online",
  population: 347,
  maxPopulation: 1000,
  uptime: "14d 7h 32m",
};
