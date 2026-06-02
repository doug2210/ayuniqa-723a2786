import game1 from "@/assets/game-1.jpg";
import game2 from "@/assets/game-2.jpg";
import game3 from "@/assets/game-3.jpg";
import game4 from "@/assets/game-4.jpg";

export type Game = {
  slug: string;
  title: string;
  tagline: string;
  category: "Classic" | "Adventure" | "Fantasy" | "Fruits";
  volatility: "Low" | "Medium" | "High";
  rtp: number;
  reels: string;
  paylines: number;
  cover: string;
  description: string;
  features: string[];
};

export const games: Game[] = [
  {
    slug: "cosmic-fortune",
    title: "Cosmic Fortune",
    tagline: "Reach for the stars, win galactic prizes.",
    category: "Adventure",
    volatility: "High",
    rtp: 96.5,
    reels: "5x4",
    paylines: 50,
    cover: game1,
    description:
      "A high-volatility space odyssey with expanding wilds, free spins, and a progressive multiplier that grows with every cosmic cluster.",
    features: ["Expanding Wilds", "Free Spins", "Progressive Multiplier", "Bonus Buy"],
  },
  {
    slug: "dragon-blaze",
    title: "Dragon Blaze",
    tagline: "Awaken the dragon, ignite massive wins.",
    category: "Fantasy",
    volatility: "High",
    rtp: 96.2,
    reels: "5x3",
    paylines: 25,
    cover: game2,
    description:
      "Mystical fantasy slot featuring flaming respins, dragon wilds, and an explosive hold-and-win bonus round.",
    features: ["Hold & Win", "Dragon Wilds", "Flaming Respins"],
  },
  {
    slug: "fruit-fiesta",
    title: "Fruit Fiesta",
    tagline: "A juicy classic with a modern twist.",
    category: "Fruits",
    volatility: "Low",
    rtp: 96.8,
    reels: "5x3",
    paylines: 20,
    cover: game3,
    description:
      "Bright, energetic and instantly addictive. Cascading fruits drop fresh wins with every spin.",
    features: ["Cascading Reels", "Cluster Pays", "Mystery Symbols"],
  },
  {
    slug: "pharaohs-gold",
    title: "Pharaoh's Gold",
    tagline: "Unlock the treasures of ancient Egypt.",
    category: "Adventure",
    volatility: "Medium",
    rtp: 96.4,
    reels: "5x3",
    paylines: 30,
    cover: game4,
    description:
      "Discover scarab scatters, expanding pharaoh symbols, and a tomb-bonus that reveals layered jackpots.",
    features: ["Expanding Symbols", "Tomb Bonus", "4 Jackpot Tiers"],
  },
];

export const categories: Game["category"][] = ["Classic", "Adventure", "Fantasy", "Fruits"];
