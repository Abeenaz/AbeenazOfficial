// ========================================
// ABEENAZ LUXURY PARLOUR - LOCALSTORAGE DB
// ========================================

import { Database, Client, Staff, ServiceCategory, LoyaltyShopItem, InventoryItem, LookbookItem, Config, Rank, RANK_CONFIGS } from './types';

const DB_KEY = 'abeenaz_v5';

// Default Configuration
const DEFAULT_CONFIG: Config = {
  pointsPerHundred: 1,
  brand: 'Abeenaz Beauty Parlour',
  tagline: 'Where Elegance Meets Excellence',
  heroTitle: 'Discover Your Radiance',
  heroSub: 'Luxury beauty experiences crafted with care in the heart of Karachi',
  estYear: '2018',
  statClients: '500+',
  statExp: '7+ Years',
  statServices: '50+',
  address: 'DHA Phase 6, Karachi, Pakistan',
  contact: '+92 319 264 1891',
  hours: 'Mon-Sat: 10AM - 8PM',
  ctaText: 'Book Your Experience',
  aboutText: 'At Abeenaz, we believe every woman deserves to feel beautiful. Our expert stylists and therapists bring years of experience and passion to every service.',
  vibes: [
    { id: 'v1', emoji: '✨', label: 'Glamorous', color: '#c9a84c' },
    { id: 'v2', emoji: '🌸', label: 'Romantic', color: '#e8a4b8' },
    { id: 'v3', emoji: '🌿', label: 'Natural', color: '#8bc38b' },
    { id: 'v4', emoji: '👑', label: 'Bridal', color: '#c9a84c' },
    { id: 'v5', emoji: '💆', label: 'Relaxed', color: '#9bb8d4' },
    { id: 'v6', emoji: '🔥', label: 'Bold', color: '#d4847a' },
  ],
};

// Default Services
const DEFAULT_SERVICES: ServiceCategory[] = [
  {
    id: 'hair',
    name: 'Hair',
    items: [
      { id: 'h1', name: 'Haircut & Style', price: 1500 },
      { id: 'h2', name: 'Keratin Treatment', price: 6000 },
      { id: 'h3', name: 'Hair Color', price: 3500 },
      { id: 'h4', name: 'Highlights', price: 5000 },
      { id: 'h5', name: 'Deep Conditioning', price: 1200 },
      { id: 'h6', name: 'Bridal Hair Styling', price: 8000 },
    ],
  },
  {
    id: 'skin',
    name: 'Skin',
    items: [
      { id: 's1', name: 'Gold Facial', price: 2500 },
      { id: 's2', name: 'Diamond Facial', price: 3500 },
      { id: 's3', name: 'Anti-Aging Facial', price: 4000 },
      { id: 's4', name: 'Clean Up', price: 800 },
      { id: 's5', name: 'Bleach', price: 600 },
      { id: 's6', name: 'Bridal Package', price: 15000 },
    ],
  },
  {
    id: 'nails',
    name: 'Nails',
    items: [
      { id: 'n1', name: 'Manicure', price: 600 },
      { id: 'n2', name: 'Pedicure', price: 800 },
      { id: 'n3', name: 'Gel Nails', price: 2000 },
      { id: 'n4', name: 'Nail Art', price: 500 },
      { id: 'n5', name: 'Acrylic Extensions', price: 3500 },
    ],
  },
  {
    id: 'bridal',
    name: 'Bridal',
    items: [
      { id: 'b1', name: 'Bridal Makeup', price: 25000 },
      { id: 'b2', name: 'Bridal Mehndi', price: 8000 },
      { id: 'b3', name: 'Full Bridal Package', price: 50000 },
      { id: 'b4', name: 'Engagement Look', price: 15000 },
      { id: 'b5', name: 'Walima Look', price: 18000 },
      { id: 'b6', name: 'Maya Look', price: 12000 },
    ],
  },
];

// Default Loyalty Shop
const DEFAULT_LOYALTY_SHOP: LoyaltyShopItem[] = [
  { id: 'l1', name: 'Free Manicure', points: 100, desc: 'Complimentary manicure service' },
  { id: 'l2', name: '20% Off Next Visit', points: 150, desc: 'Get 20% off on your next visit' },
  { id: 'l3', name: 'Free Facial', points: 300, desc: 'Complimentary gold facial' },
];

// Default Inventory
const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Hair Color Tubes', qty: 5, lowAt: 10, unit: 'pcs' },
  { id: 'i2', name: 'Facial Cream', qty: 3, lowAt: 5, unit: 'jars' },
  { id: 'i3', name: 'Nail Polish Set', qty: 15, lowAt: 8, unit: 'sets' },
  { id: 'i4', name: 'Bleach Powder', qty: 8, lowAt: 5, unit: 'packs' },
  { id: 'i5', name: 'Mehndi Cones', qty: 4, lowAt: 10, unit: 'cones' },
];

// Default Staff
const DEFAULT_STAFF: Staff[] = [
  { id: 'st1', name: 'Ayesha Khan', role: 'Senior Stylist', commissionPct: 15, earnings: {}, active: true },
  { id: 'st2', name: 'Fatima Ali', role: 'Makeup Artist', commissionPct: 20, earnings: {}, active: true },
  { id: 'st3', name: 'Zainab Malik', role: 'Nail Technician', commissionPct: 12, earnings: {}, active: true },
];

// Default Lookbook
const DEFAULT_LOOKBOOK: LookbookItem[] = [
  { id: 'lb1', title: 'Bridal Glow', service: 'Bridal Package', price: 50000, emoji: '👰' },
  { id: 'lb2', title: 'Keratin Smooth', service: 'Keratin Treatment', price: 6000, emoji: '💇' },
  { id: 'lb3', title: 'Golden Hour', service: 'Gold Facial', price: 2500, emoji: '✨' },
  { id: 'lb4', title: 'Nail Art Magic', service: 'Gel Nails + Art', price: 2500, emoji: '💅' },
  { id: 'lb5', title: 'Mehndi Elegance', service: 'Bridal Mehndi', price: 8000, emoji: '🎨' },
  { id: 'lb6', title: 'Party Ready', service: 'Hair + Makeup', price: 8000, emoji: '🎉' },
];

// Helper functions
function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function calculateRank(lifetimeSpend: number): Rank {
  let rank: Rank = 'new';
  for (const config of RANK_CONFIGS) {
    if (lifetimeSpend >= config.lifetimeMin) {
      rank = config.rank;
    }
  }
  return rank;
}

// Generate sample clients
function generateSampleClients(): Record<string, Client> {
  const now = new Date();
  const currentMonth = getCurrentMonthKey();
  
  return {
    '3001234567': {
      phone: '3001234567',
      name: 'Zara Ahmed',
      joinDate: '2024-01-15',
      birthday: '1990-03-15',
      visits: 15,
      lifetimeSpend: 25000,
      monthlySpend: { [currentMonth]: 3500 },
      loyaltyPoints: 250,
      visitLog: [],
      redemptionLog: [],
      rankHistory: [{ date: '2024-06-20', event: 'promotion', fromRank: 'silver', toRank: 'gold' }],
      referredBy: '3012345678',
      referralDiscount: false,
      referralGiven: true,
      missedMonths: 0,
      notes: 'Prefers organic products. VIP client.',
      staffId: 'st1',
    },
    '3012345678': {
      phone: '3012345678',
      name: 'Sana Khan',
      joinDate: '2023-06-10',
      birthday: '1988-07-22',
      visits: 32,
      lifetimeSpend: 45000,
      monthlySpend: { [currentMonth]: 8500 },
      loyaltyPoints: 480,
      visitLog: [],
      redemptionLog: [],
      rankHistory: [{ date: '2024-03-15', event: 'promotion', fromRank: 'gold', toRank: 'diamond' }],
      missedMonths: 0,
      staffId: 'st2',
    },
    '3023456789': {
      phone: '3023456789',
      name: 'Areeba Hassan',
      joinDate: '2024-11-01',
      birthday: '1995-11-30',
      visits: 3,
      lifetimeSpend: 3500,
      monthlySpend: { [currentMonth]: 500 },
      loyaltyPoints: 35,
      visitLog: [],
      redemptionLog: [],
      rankHistory: [],
      missedMonths: 1,
      staffId: 'st3',
    },
  };
}

// Create default database
function createDefaultDatabase(): Database {
  return {
    clients: generateSampleClients(),
    admins: ['3192641891'],
    staff: DEFAULT_STAFF,
    inventory: DEFAULT_INVENTORY,
    config: DEFAULT_CONFIG,
    services: DEFAULT_SERVICES,
    loyaltyShop: DEFAULT_LOYALTY_SHOP,
    lookbook: DEFAULT_LOOKBOOK,
    revenue: {},
    billCounter: 0,
  };
}

// Get database from localStorage
export function getDB(): Database {
  if (typeof window === 'undefined') {
    return createDefaultDatabase();
  }
  
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    const defaultDB = createDefaultDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    const defaultDB = createDefaultDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
}

// Save database to localStorage
export function saveDB(db: Database): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
}

// Reset database to defaults
export function resetDB(): void {
  const defaultDB = createDefaultDatabase();
  saveDB(defaultDB);
}

// Client operations
export function getClient(phone: string): Client | undefined {
  const db = getDB();
  return db.clients[phone];
}

export function saveClient(client: Client): void {
  const db = getDB();
  db.clients[client.phone] = client;
  saveDB(db);
}

export function deleteClient(phone: string): void {
  const db = getDB();
  delete db.clients[phone];
  saveDB(db);
}

export function getAllClients(): Client[] {
  const db = getDB();
  return Object.values(db.clients);
}

// Get client's current rank
export function getClientRank(client: Client): Rank {
  if (client.rankLocked && client.demotedFrom) {
    return client.demotedFrom;
  }
  if (client.demoted && client.demotedFrom) {
    // Check if within restoration window
    if (client.demotedDate) {
      const demotionDate = new Date(client.demotedDate);
      const now = new Date();
      const monthsSince = (now.getFullYear() - demotionDate.getFullYear()) * 12 + 
                          (now.getMonth() - demotionDate.getMonth());
      if (monthsSince < 2) {
        return calculateRank(client.lifetimeSpend);
      }
    }
  }
  return calculateRank(client.lifetimeSpend);
}

// Get maintenance status
export function getMaintenanceStatus(client: Client): { percent: number; amountNeeded: number; color: string; status: string } {
  const rank = getClientRank(client);
  const config = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
  const currentMonth = getCurrentMonthKey();
  const spent = client.monthlySpend[currentMonth] || 0;
  const required = config.monthlyMin;
  const percent = required > 0 ? Math.min((spent / required) * 100, 100) : 100;
  const amountNeeded = Math.max(0, required - spent);
  
  let color = '#4ade80'; // green
  let status = 'good';
  
  if (client.demoted) {
    color = '#f472b6'; // pink/rose
    status = 'demoted';
  } else if (percent < 30) {
    color = '#ef4444'; // red
    status = 'critical';
  } else if (percent < 60) {
    color = '#f97316'; // orange
    status = 'warning';
  } else if (percent < 100) {
    color = '#c9a84c'; // gold
    status = 'needs-attention';
  }
  
  return { percent, amountNeeded, color, status };
}

// Admin operations
export function isAdmin(phone: string): boolean {
  const db = getDB();
  return db.admins.includes(phone);
}

export function addAdmin(phone: string): void {
  const db = getDB();
  if (!db.admins.includes(phone)) {
    db.admins.push(phone);
    saveDB(db);
  }
}

export function removeAdmin(phone: string): void {
  const db = getDB();
  db.admins = db.admins.filter(a => a !== phone);
  saveDB(db);
}

// Verify admin PIN
export function verifyPin(phone: string, pin: string): { success: boolean; needsPinSet: boolean; error?: string } {
  const client = getClient(phone);
  
  if (!client) {
    return { success: false, needsPinSet: false, error: 'Phone number not registered' };
  }
  
  if (!isAdmin(phone)) {
    return { success: false, needsPinSet: false, error: 'Not an admin' };
  }
  
  // Default PIN is last 4 digits of phone
  const defaultPin = phone.slice(-4);
  
  if (!client.pinSet) {
    // First login - check default PIN
    if (pin === defaultPin) {
      return { success: true, needsPinSet: true };
    }
    return { success: false, needsPinSet: false, error: 'Invalid PIN' };
  }
  
  // PIN already set
  if (client.pin === pin) {
    return { success: true, needsPinSet: false };
  }
  
  return { success: false, needsPinSet: false, error: 'Invalid PIN' };
}

// Set new PIN
export function setPin(phone: string, newPin: string): { success: boolean; error?: string } {
  const defaultPin = phone.slice(-4);
  
  if (newPin === defaultPin) {
    return { success: false, error: 'PIN cannot be same as default (last 4 digits of phone)' };
  }
  
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return { success: false, error: 'PIN must be exactly 4 digits' };
  }
  
  const client = getClient(phone);
  if (!client) {
    return { success: false, error: 'Client not found' };
  }
  
  client.pin = newPin;
  client.pinSet = true;
  saveClient(client);
  
  return { success: true };
}

// Bill counter
export function getNextBillNumber(): string {
  const db = getDB();
  db.billCounter += 1;
  saveDB(db);
  const year = new Date().getFullYear();
  return `ABZ-${year}-${String(db.billCounter).padStart(4, '0')}`;
}

// Revenue tracking
export function addRevenue(amount: number): void {
  const db = getDB();
  const monthKey = getCurrentMonthKey();
  db.revenue[monthKey] = (db.revenue[monthKey] || 0) + amount;
  saveDB(db);
}

export function getTotalRevenue(): number {
  const db = getDB();
  return Object.values(db.revenue).reduce((sum, val) => sum + val, 0);
}

export function getMonthlyRevenue(month: string): number {
  const db = getDB();
  return db.revenue[month] || 0;
}

// Staff operations
export function getStaff(id: string): Staff | undefined {
  const db = getDB();
  return db.staff.find(s => s.id === id);
}

export function addStaffCommission(staffId: string, amount: number): void {
  const db = getDB();
  const staff = db.staff.find(s => s.id === staffId);
  if (staff) {
    const monthKey = getCurrentMonthKey();
    staff.earnings[monthKey] = (staff.earnings[monthKey] || 0) + amount;
    saveDB(db);
  }
}

// Inventory operations
export function getLowStockItems(): InventoryItem[] {
  const db = getDB();
  return db.inventory.filter(item => item.qty <= item.lowAt);
}

export function updateInventory(id: string, qty: number): void {
  const db = getDB();
  const item = db.inventory.find(i => i.id === id);
  if (item) {
    item.qty = qty;
    saveDB(db);
  }
}

// Generate WhatsApp link
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = phone.startsWith('92') ? phone : `92${phone}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Get current date in YYYY-MM-DD format
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
