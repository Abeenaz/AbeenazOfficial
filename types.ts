// ========================================
// ABEENAZ LUXURY PARLOUR - TYPE DEFINITIONS
// ========================================

// Rank Tiers
export type Rank = 'new' | 'bronze' | 'silver' | 'gold' | 'diamond';

// Rank configuration
export interface RankConfig {
  rank: Rank;
  label: string;
  emoji: string;
  lifetimeMin: number;
  monthlyMin: number;
  discount: number;
  pointsMultiplier: number;
  birthdayBonus: number;
}

export const RANK_CONFIGS: RankConfig[] = [
  { rank: 'new', label: 'New', emoji: '🆕', lifetimeMin: 0, monthlyMin: 0, discount: 0, pointsMultiplier: 1, birthdayBonus: 0 },
  { rank: 'bronze', label: 'Bronze', emoji: '🥉', lifetimeMin: 5000, monthlyMin: 1000, discount: 0, pointsMultiplier: 1, birthdayBonus: 0 },
  { rank: 'silver', label: 'Silver', emoji: '🥈', lifetimeMin: 10000, monthlyMin: 2000, discount: 5, pointsMultiplier: 1, birthdayBonus: 0 },
  { rank: 'gold', label: 'Gold', emoji: '⭐', lifetimeMin: 20000, monthlyMin: 4000, discount: 10, pointsMultiplier: 1, birthdayBonus: 0 },
  { rank: 'diamond', label: 'Diamond', emoji: '💎', lifetimeMin: 35000, monthlyMin: 7000, discount: 10, pointsMultiplier: 1.1, birthdayBonus: 5 },
];

// Client Schema
export interface VisitLog {
  billNo: string;
  date: string;
  services: ServiceItem[];
  originalTotal: number;
  charged: number;
  discountPct: number;
  discountLabels: string[];
  pts: number;
  staffId?: string;
  refDiscount?: boolean;
  birthdayBonus?: boolean;
}

export interface RedemptionLog {
  date: string;
  item: string;
  points: number;
}

export interface RankHistory {
  date: string;
  event: 'promotion' | 'demotion' | 'restoration';
  fromRank: Rank;
  toRank: Rank;
}

export interface Client {
  phone: string;
  name: string;
  pin?: string;
  pinSet?: boolean;
  joinDate: string;
  birthday?: string;
  visits: number;
  lifetimeSpend: number;
  monthlySpend: Record<string, number>;
  loyaltyPoints: number;
  visitLog: VisitLog[];
  redemptionLog: RedemptionLog[];
  rankHistory: RankHistory[];
  referredBy?: string;
  referralDiscount?: boolean;
  referralGiven?: boolean;
  demoted?: boolean;
  demotedFrom?: Rank;
  demotedDate?: string;
  missedMonths: number;
  lastMaintCheck?: string;
  rankLocked?: boolean;
  notes?: string;
  staffId?: string;
}

// Staff Schema
export interface Staff {
  id: string;
  name: string;
  role: string;
  commissionPct: number;
  earnings: Record<string, number>;
  active: boolean;
}

// Inventory Schema
export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  lowAt: number;
  unit: string;
}

// Service Schema
export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  qty?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  items: ServiceItem[];
}

// Loyalty Shop
export interface LoyaltyShopItem {
  id: string;
  name: string;
  points: number;
  desc: string;
}

// Vibe Buttons
export interface Vibe {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

// Lookbook
export interface LookbookItem {
  id: string;
  title: string;
  service: string;
  price: number;
  emoji: string;
  image?: string;
}

// Configuration
export interface Config {
  pointsPerHundred: number;
  brand: string;
  tagline: string;
  heroTitle: string;
  heroSub: string;
  estYear: string;
  statClients: string;
  statExp: string;
  statServices: string;
  address: string;
  contact: string;
  hours: string;
  ctaText: string;
  aboutText: string;
  vibes: Vibe[];
}

// Database Schema
export interface Database {
  clients: Record<string, Client>;
  admins: string[];
  staff: Staff[];
  inventory: InventoryItem[];
  config: Config;
  services: ServiceCategory[];
  loyaltyShop: LoyaltyShopItem[];
  lookbook: LookbookItem[];
  revenue: Record<string, number>;
  billCounter: number;
}

// UI State Types
export interface MaintenanceStatus {
  percent: number;
  color: string;
  status: 'good' | 'warning' | 'danger' | 'critical' | 'demoted';
  amountNeeded: number;
}

export interface AlertInfo {
  type: 'early' | 'grace' | 'demoted';
  message: string;
  deadline?: string;
}
