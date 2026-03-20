// ========================================
// ABEENAZ LUXURY PARLOUR - ZUSTAND STORE
// ========================================

import { create } from 'zustand';
import { Client, Staff, ServiceCategory, LoyaltyShopItem, InventoryItem, LookbookItem, Config, Rank, RANK_CONFIGS } from './types';
import { 
  getDB, saveDB, getClient, saveClient, deleteClient, getAllClients,
  isAdmin, addAdmin, removeAdmin, verifyPin, setPin,
  getNextBillNumber, addRevenue, getStaff, addStaffCommission,
  getCurrentMonthKey, getCurrentDate
} from './db-storage';

// Auth State
interface AuthState {
  isAuthenticated: boolean;
  adminPhone: string | null;
  needsPinSet: boolean;
  login: (phone: string, pin: string) => { success: boolean; error?: string; needsPinSet?: boolean };
  setNewPin: (pin: string) => { success: boolean; error?: string };
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  adminPhone: null,
  needsPinSet: false,

  login: (phone: string, pin: string) => {
    const result = verifyPin(phone, pin);
    if (result.success) {
      set({ 
        isAuthenticated: true, 
        adminPhone: phone,
        needsPinSet: result.needsPinSet 
      });
    }
    return result;
  },

  setNewPin: (pin: string) => {
    const { adminPhone } = get();
    if (!adminPhone) {
      return { success: false, error: 'Not logged in' };
    }
    const result = setPin(adminPhone, pin);
    if (result.success) {
      set({ needsPinSet: false });
    }
    return result;
  },

  logout: () => {
    set({ isAuthenticated: false, adminPhone: null, needsPinSet: false });
  },

  checkAuth: () => {
    // Check if there's a stored session
    const stored = sessionStorage.getItem('abeenaz_session');
    if (stored) {
      const { phone, timestamp } = JSON.parse(stored);
      // Session valid for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        if (isAdmin(phone)) {
          set({ isAuthenticated: true, adminPhone: phone });
        }
      }
    }
  },
}));

// App State
interface AppState {
  currentTab: string;
  showExplore: boolean;
  selectedClient: Client | null;
  showClientModal: boolean;
  showBillModal: boolean;
  editingClient: Client | null;
  
  setCurrentTab: (tab: string) => void;
  setShowExplore: (show: boolean) => void;
  setSelectedClient: (client: Client | null) => void;
  setShowClientModal: (show: boolean) => void;
  setShowBillModal: (show: boolean) => void;
  setEditingClient: (client: Client | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTab: 'dashboard',
  showExplore: false,
  selectedClient: null,
  showClientModal: false,
  showBillModal: false,
  editingClient: null,

  setCurrentTab: (tab) => set({ currentTab: tab }),
  setShowExplore: (show) => set({ showExplore: show }),
  setSelectedClient: (client) => set({ selectedClient: client }),
  setShowClientModal: (show) => set({ showClientModal: show }),
  setShowBillModal: (show) => set({ showBillModal: show }),
  setEditingClient: (client) => set({ editingClient: client }),
}));

// Clients Store
interface ClientsState {
  clients: Client[];
  refreshClients: () => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (phone: string) => void;
  getClient: (phone: string) => Client | undefined;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],

  refreshClients: () => {
    set({ clients: getAllClients() });
  },

  addClient: (client: Client) => {
    saveClient(client);
    set({ clients: getAllClients() });
  },

  updateClient: (client: Client) => {
    saveClient(client);
    set({ clients: getAllClients() });
  },

  removeClient: (phone: string) => {
    deleteClient(phone);
    set({ clients: getAllClients() });
  },

  getClient: (phone: string) => {
    return getClient(phone);
  },
}));

// Bill State
interface BillState {
  selectedServices: { categoryId: string; serviceId: string; name: string; price: number; qty: number }[];
  billClient: Client | null;
  billStaff: Staff | null;
  
  setBillClient: (client: Client | null) => void;
  setBillStaff: (staff: Staff | null) => void;
  addService: (categoryId: string, serviceId: string, name: string, price: number) => void;
  removeService: (serviceId: string) => void;
  updateServiceQty: (serviceId: string, qty: number) => void;
  clearBill: () => void;
  calculateTotals: () => {
    subtotal: number;
    rankDiscount: number;
    referralDiscount: number;
    birthdayBonus: number;
    totalDiscount: number;
    total: number;
    points: number;
  };
  completeBill: () => { success: boolean; billNo: string; message: string };
}

export const useBillStore = create<BillState>((set, get) => ({
  selectedServices: [],
  billClient: null,
  billStaff: null,

  setBillClient: (client) => set({ billClient: client }),
  setBillStaff: (staff) => set({ billStaff: staff }),

  addService: (categoryId, serviceId, name, price) => {
    const { selectedServices } = get();
    const existing = selectedServices.find(s => s.serviceId === serviceId);
    if (existing) {
      set({
        selectedServices: selectedServices.map(s =>
          s.serviceId === serviceId ? { ...s, qty: s.qty + 1 } : s
        ),
      });
    } else {
      set({
        selectedServices: [...selectedServices, { categoryId, serviceId, name, price, qty: 1 }],
      });
    }
  },

  removeService: (serviceId) => {
    set({ selectedServices: get().selectedServices.filter(s => s.serviceId !== serviceId) });
  },

  updateServiceQty: (serviceId, qty) => {
    if (qty <= 0) {
      get().removeService(serviceId);
    } else {
      set({
        selectedServices: get().selectedServices.map(s =>
          s.serviceId === serviceId ? { ...s, qty } : s
        ),
      });
    }
  },

  clearBill: () => set({ selectedServices: [], billClient: null, billStaff: null }),

  calculateTotals: () => {
    const { selectedServices, billClient } = get();
    
    const subtotal = selectedServices.reduce((sum, s) => sum + s.price * s.qty, 0);
    
    // Default values
    let rankDiscount = 0;
    let referralDiscount = 0;
    let birthdayBonus = 0;
    let pointsMultiplier = 1;
    
    if (billClient) {
      // Get rank config
      const clientRank = calculateClientRank(billClient);
      const config = RANK_CONFIGS.find(r => r.rank === clientRank) || RANK_CONFIGS[0];
      
      rankDiscount = config.discount;
      pointsMultiplier = config.pointsMultiplier;
      
      // Referral discount
      if (billClient.referralDiscount && !billClient.referralGiven) {
        referralDiscount = 10;
      }
      
      // Birthday bonus for Diamond members
      if (clientRank === 'diamond' && billClient.birthday) {
        const now = new Date();
        const birthMonth = new Date(billClient.birthday).getMonth();
        if (now.getMonth() === birthMonth) {
          birthdayBonus = config.birthdayBonus;
        }
      }
    }
    
    const totalDiscountPct = rankDiscount + referralDiscount + birthdayBonus;
    const totalDiscount = Math.round(subtotal * totalDiscountPct / 100);
    const total = subtotal - totalDiscount;
    
    // Points calculation
    const db = getDB();
    const pointsPerHundred = db.config.pointsPerHundred || 1;
    const points = Math.round(subtotal / 100 * pointsPerHundred * pointsMultiplier);
    
    return {
      subtotal,
      rankDiscount,
      referralDiscount,
      birthdayBonus,
      totalDiscount,
      total,
      points,
    };
  },

  completeBill: () => {
    const { selectedServices, billClient, billStaff } = get();
    
    if (!billClient) {
      return { success: false, billNo: '', message: 'No client selected' };
    }
    
    if (selectedServices.length === 0) {
      return { success: false, billNo: '', message: 'No services selected' };
    }
    
    const totals = get().calculateTotals();
    const billNo = getNextBillNumber();
    const now = new Date();
    
    // Create visit log
    const visitLog = {
      billNo,
      date: now.toISOString(),
      services: selectedServices.map(s => ({ id: s.serviceId, name: s.name, price: s.price, qty: s.qty })),
      originalTotal: totals.subtotal,
      charged: totals.total,
      discountPct: totals.rankDiscount + totals.referralDiscount + totals.birthdayBonus,
      discountLabels: [
        ...(totals.rankDiscount > 0 ? [`${RANK_CONFIGS.find(r => r.rank === calculateClientRank(billClient))?.label} Discount`] : []),
        ...(totals.referralDiscount > 0 ? ['Referral 🎁'] : []),
        ...(totals.birthdayBonus > 0 ? ['Birthday 🎂'] : []),
      ],
      pts: totals.points,
      staffId: billStaff?.id,
      refDiscount: totals.referralDiscount > 0,
      birthdayBonus: totals.birthdayBonus > 0,
    };
    
    // Update client
    const currentMonth = getCurrentMonthKey();
    const updatedClient = { ...billClient };
    updatedClient.visits += 1;
    updatedClient.lifetimeSpend += totals.total;
    updatedClient.monthlySpend[currentMonth] = (updatedClient.monthlySpend[currentMonth] || 0) + totals.total;
    updatedClient.loyaltyPoints += totals.points;
    updatedClient.visitLog.unshift(visitLog);
    
    // Handle referral discount
    if (updatedClient.referralDiscount && !updatedClient.referralGiven) {
      updatedClient.referralGiven = true;
      updatedClient.referralDiscount = false;
    }
    
    // Check for rank promotion
    const oldRank = calculateClientRank(billClient);
    const newRank = calculateClientRank(updatedClient);
    if (oldRank !== newRank) {
      updatedClient.rankHistory.unshift({
        date: getCurrentDate(),
        event: 'promotion',
        fromRank: oldRank,
        toRank: newRank,
      });
    }
    
    // Reset missed months
    updatedClient.missedMonths = 0;
    
    saveClient(updatedClient);
    
    // Update revenue
    addRevenue(totals.total);
    
    // Update staff commission
    if (billStaff) {
      const commission = Math.round(totals.total * billStaff.commissionPct / 100);
      addStaffCommission(billStaff.id, commission);
    }
    
    // Generate WhatsApp message
    const message = generateBillMessage(billNo, updatedClient, selectedServices, totals);
    
    // Clear bill
    set({ selectedServices: [], billClient: null, billStaff: null });
    
    return { success: true, billNo, message };
  },
}));

// Helper function to calculate rank
function calculateClientRank(client: Client): Rank {
  if (client.rankLocked && client.demotedFrom) {
    return client.demotedFrom;
  }
  let rank: Rank = 'new';
  for (const config of RANK_CONFIGS) {
    if (client.lifetimeSpend >= config.lifetimeMin) {
      rank = config.rank;
    }
  }
  return rank;
}

// Generate bill message for WhatsApp
function generateBillMessage(
  billNo: string,
  client: Client,
  services: { name: string; price: number; qty: number }[],
  totals: { subtotal: number; total: number; points: number; rankDiscount: number; referralDiscount: number; birthdayBonus: number }
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit', hour12: true });
  const rank = calculateClientRank(client);
  const rankConfig = RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
  
  let message = `✦ ABEENAZ BEAUTY PARLOUR ✦\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Bill No: ${billNo}\n`;
  message += `Date: ${dateStr}, ${timeStr}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Client: ${client.name} ${rankConfig.emoji} ${rankConfig.label}\n`;
  message += `Phone: +92 ${client.phone.slice(0, 3)} ${client.phone.slice(3, 6)} ${client.phone.slice(6)}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `SERVICES\n`;
  
  for (const service of services) {
    const lineTotal = service.price * service.qty;
    const dots = '.'.repeat(Math.max(1, 20 - service.name.length));
    message += `- ${service.name} (×${service.qty}) ${dots} Rs.${lineTotal.toLocaleString()}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Subtotal:         Rs.${totals.subtotal.toLocaleString()}\n`;
  
  if (totals.rankDiscount > 0 || totals.referralDiscount > 0 || totals.birthdayBonus > 0) {
    const totalDiscountPct = totals.rankDiscount + totals.referralDiscount + totals.birthdayBonus;
    const discountLabels = [];
    if (totals.rankDiscount > 0) discountLabels.push(`${rankConfig.label}`);
    if (totals.referralDiscount > 0) discountLabels.push('Referral');
    if (totals.birthdayBonus > 0) discountLabels.push('Birthday');
    message += `${discountLabels.join(' + ')} Discount:    −Rs.${totals.subtotal - totals.total} (${totalDiscountPct}%)\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `TOTAL:            Rs.${totals.total.toLocaleString()}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Points earned:    +${totals.points} pts\n`;
  message += `Total points:     ${client.loyaltyPoints + totals.points} pts\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Thank you, ${client.name}! See you soon 💛\n`;
  message += `Abeenaz · Karachi · +92 319 264 1891`;
  
  return message;
}

// Services Store
interface ServicesState {
  services: ServiceCategory[];
  refreshServices: () => void;
  updateServices: (services: ServiceCategory[]) => void;
}

export const useServicesStore = create<ServicesState>((set) => ({
  services: [],

  refreshServices: () => {
    const db = getDB();
    set({ services: db.services });
  },

  updateServices: (services) => {
    const db = getDB();
    db.services = services;
    saveDB(db);
    set({ services });
  },
}));

// Config Store
interface ConfigState {
  config: Config | null;
  refreshConfig: () => void;
  updateConfig: (config: Partial<Config>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,

  refreshConfig: () => {
    const db = getDB();
    set({ config: db.config });
  },

  updateConfig: (updates) => {
    const db = getDB();
    db.config = { ...db.config, ...updates };
    saveDB(db);
    set({ config: db.config });
  },
}));

// Staff Store
interface StaffState {
  staff: Staff[];
  refreshStaff: () => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  removeStaff: (id: string) => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],

  refreshStaff: () => {
    const db = getDB();
    set({ staff: db.staff });
  },

  addStaff: (staff) => {
    const db = getDB();
    db.staff.push(staff);
    saveDB(db);
    set({ staff: db.staff });
  },

  updateStaff: (staff) => {
    const db = getDB();
    const idx = db.staff.findIndex(s => s.id === staff.id);
    if (idx !== -1) {
      db.staff[idx] = staff;
      saveDB(db);
      set({ staff: db.staff });
    }
  },

  removeStaff: (id) => {
    const db = getDB();
    db.staff = db.staff.filter(s => s.id !== id);
    saveDB(db);
    set({ staff: db.staff });
  },
}));

// Inventory Store
interface InventoryState {
  inventory: InventoryItem[];
  refreshInventory: () => void;
  updateItem: (item: InventoryItem) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  inventory: [],

  refreshInventory: () => {
    const db = getDB();
    set({ inventory: db.inventory });
  },

  updateItem: (item) => {
    const db = getDB();
    const idx = db.inventory.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      db.inventory[idx] = item;
      saveDB(db);
      set({ inventory: db.inventory });
    }
  },

  addItem: (item) => {
    const db = getDB();
    db.inventory.push(item);
    saveDB(db);
    set({ inventory: db.inventory });
  },

  removeItem: (id) => {
    const db = getDB();
    db.inventory = db.inventory.filter(i => i.id !== id);
    saveDB(db);
    set({ inventory: db.inventory });
  },
}));

// Loyalty Store
interface LoyaltyState {
  shopItems: LoyaltyShopItem[];
  refreshLoyalty: () => void;
  addItem: (item: LoyaltyShopItem) => void;
  updateItem: (item: LoyaltyShopItem) => void;
  removeItem: (id: string) => void;
}

export const useLoyaltyStore = create<LoyaltyState>((set) => ({
  shopItems: [],

  refreshLoyalty: () => {
    const db = getDB();
    set({ shopItems: db.loyaltyShop });
  },

  addItem: (item) => {
    const db = getDB();
    db.loyaltyShop.push(item);
    saveDB(db);
    set({ shopItems: db.loyaltyShop });
  },

  updateItem: (item) => {
    const db = getDB();
    const idx = db.loyaltyShop.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      db.loyaltyShop[idx] = item;
      saveDB(db);
      set({ shopItems: db.loyaltyShop });
    }
  },

  removeItem: (id) => {
    const db = getDB();
    db.loyaltyShop = db.loyaltyShop.filter(i => i.id !== id);
    saveDB(db);
    set({ shopItems: db.loyaltyShop });
  },
}));

// Lookbook Store
interface LookbookState {
  items: LookbookItem[];
  refreshLookbook: () => void;
  addItem: (item: LookbookItem) => void;
  updateItem: (item: LookbookItem) => void;
  removeItem: (id: string) => void;
}

export const useLookbookStore = create<LookbookState>((set) => ({
  items: [],

  refreshLookbook: () => {
    const db = getDB();
    set({ items: db.lookbook });
  },

  addItem: (item) => {
    const db = getDB();
    db.lookbook.push(item);
    saveDB(db);
    set({ items: db.lookbook });
  },

  updateItem: (item) => {
    const db = getDB();
    const idx = db.lookbook.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      db.lookbook[idx] = item;
      saveDB(db);
      set({ items: db.lookbook });
    }
  },

  removeItem: (id) => {
    const db = getDB();
    db.lookbook = db.lookbook.filter(i => i.id !== id);
    saveDB(db);
    set({ items: db.lookbook });
  },
}));
