/* ═══════════════════════════════════════════════════════════════════
   ABEENAZ LUXURY PARLOR — app.js  v5
   ─────────────────────────────────────────────────────────────────
   STATUS ENGINE RULES:
   • Bronze  ≥ Rs.5,000  lifetime | Rs.1,000/mo maintenance
   • Silver  ≥ Rs.10,000 lifetime | Rs.2,000/mo maintenance | 5% off
   • Gold    ≥ Rs.20,000 lifetime | Rs.4,000/mo maintenance | 10% off
   • Diamond ≥ Rs.35,000 lifetime | Rs.7,000/mo maintenance | 10% off + 1.1× pts + birthday 5%
   ─────────────────────────────────────────────────────────────────
   RANK-DROP LOGIC:
   • Miss month 1 + day > 15  → WARNING shown
   • Miss month 2 in a row    → DROP one rank, log demotion date
   ─────────────────────────────────────────────────────────────────
   RANK-RESTORE LOGIC:
   • After demotion, spend previous rank's monthly min within 2 months
     → rank restored automatically
   ─────────────────────────────────────────────────────────────────
   ALL PREVIOUS FEATURES KEPT:
   Referrals · Auto-visit engine · Loyalty shop · Redeemer ·
   Revenue tracker · WhatsApp alerts · Customisation · Services mgmt ·
   Client modal · Admin CRM · Explore page
═══════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════
   1. ANIMATED PARTICLE BACKGROUND
══════════════════════════════════════════════════════ */
(function initCanvas() {
  var canvas = document.getElementById('bg-canvas');
  var ctx    = canvas.getContext('2d');
  var W, H;
  var particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() { this.reset(); }

  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.5 + 0.3;
    this.a  = Math.random() * 0.35 + 0.05;
    this.dx = (Math.random() - 0.5) * 0.3;
    this.dy = (Math.random() - 0.5) * 0.3;
  };

  Particle.prototype.update = function () {
    this.x += this.dx;
    this.y += this.dy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  resize();
  window.addEventListener('resize', resize);
  for (var i = 0; i < 90; i++) particles.push(new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function (p) {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,' + p.a + ')';
      ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
})();


/* ══════════════════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════════════════ */
(function initCursor() {
  var dot  = document.getElementById('cursor');
  var ring = document.getElementById('cursor-follower');
  var mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  var hoverTargets = 'button,input,a,select,textarea,.nk,.srv-tab,.a-tab,.admin-item,.pillar,.spec-card,.vibe-btn,.lookbook-item';

  document.addEventListener('mouseover', function (e) {
    if (e.target.matches(hoverTargets)) {
      dot.style.width = '14px'; dot.style.height = '14px';
      ring.style.width = '48px'; ring.style.height = '48px';
      ring.style.borderColor = 'rgba(201,168,76,0.8)';
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.matches(hoverTargets)) {
      dot.style.width = '8px'; dot.style.height = '8px';
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = 'rgba(201,168,76,0.5)';
    }
  });
})();


/* ══════════════════════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════════════════════ */
function initScrollReveal() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('spec-card')) {
          entry.target.style.transitionDelay = (entry.target.dataset.delay || 0) + 'ms';
        }
        if (entry.target.classList.contains('lookbook-item')) {
          entry.target.style.transitionDelay = (entry.target.dataset.delay || 0) + 'ms';
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-block, .spec-card, .lookbook-item').forEach(function (el) {
    observer.observe(el);
  });
}


/* ══════════════════════════════════════════════════════
   4. ABEENAZ STATUS ENGINE — TIER DEFINITIONS
   ─────────────────────────────────────────────────────
   threshold    = lifetime spend to earn rank
   monthlyMin   = monthly maintenance (20% of threshold)
   discount     = checkout discount multiplier
   pointMult    = loyalty points multiplier (Diamond = 1.1×)
   birthdayDisc = extra birthday discount (Diamond only)
══════════════════════════════════════════════════════ */
var TIERS = [
  {
    rank:         'diamond',
    label:        '💎 Diamond',
    threshold:    35000,
    monthlyMin:   7000,
    discount:     0.10,
    pointMult:    1.1,
    birthdayDisc: 0.05
  },
  {
    rank:        'gold',
    label:       '⭐ Gold',
    threshold:   20000,
    monthlyMin:  4000,
    discount:    0.10,
    pointMult:   1.0,
    birthdayDisc: 0
  },
  {
    rank:        'silver',
    label:       '🥈 Silver',
    threshold:   10000,
    monthlyMin:  2000,
    discount:    0.05,
    pointMult:   1.0,
    birthdayDisc: 0
  },
  {
    rank:        'bronze',
    label:       '🥉 Bronze',
    threshold:   5000,
    monthlyMin:  1000,
    discount:    0.00,
    pointMult:   1.0,
    birthdayDisc: 0
  },
  {
    rank:        'new',
    label:       '🆕 New',
    threshold:   0,
    monthlyMin:  0,
    discount:    0.00,
    pointMult:   1.0,
    birthdayDisc: 0
  }
];

/* Return tier config object for a rank string */
function getTier(rank) {
  return TIERS.find(function (t) { return t.rank === rank; }) || TIERS[TIERS.length - 1];
}

/* Calculate rank purely from lifetime spend */
function calcRankFromSpend(lifetimeSpend) {
  for (var i = 0; i < TIERS.length; i++) {
    if (lifetimeSpend >= TIERS[i].threshold) return TIERS[i];
  }
  return TIERS[TIERS.length - 1];
}

/* Sync client.rank with their lifetimeSpend */
function ensureRank(client) {
  /* If rank is locked (VIP override), do not change it */
  if (client.rankLocked) return;
  var earned = calcRankFromSpend(client.lifetimeSpend || 0).rank;
  /* If they were demoted, stay demoted unless restore logic re-promotes */
  if (!client.demoted) {
    client.rank = earned;
  }
}

/* Points earned for a transaction */
function calcPoints(spendAmount, rank) {
  var rate  = DB.config.pointsPerHundred || 1;
  var base  = Math.floor(spendAmount / 100) * rate;
  var multi = getTier(rank).pointMult;
  return Math.floor(base * multi);
}

/* Current month key "YYYY-MM" */
function monthKey(offsetMonths) {
  var d = new Date();
  if (offsetMonths) d.setMonth(d.getMonth() + offsetMonths);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

/* Previous month key */
function prevMonthKey() { return monthKey(-1); }


/* ══════════════════════════════════════════════════════
   5. RANK-DROP & RESTORATION ENGINE
   ─────────────────────────────────────────────────────
   missedMonths  tracks consecutive missed months
   demoted       true if they were dropped
   demotedDate   ISO date of demotion
   demotedFrom   rank they had before drop
   restoreTarget monthly spend needed to restore rank
══════════════════════════════════════════════════════ */

/*
  Call this whenever we need to check a client's maintenance status.
  Returns a rich object used by the UI and admin panel.
*/
function maintenanceStatus(client) {
  var tier = getTier(client.rank);
  var key  = monthKey();

  /* New / no-maintenance tiers */
  if (!tier.monthlyMin) {
    return {
      ok:           true,
      spent:        0,
      needed:       0,
      pct:          100,
      warn:         false,
      earlyWarning: false,
      demoted:      false,
      canRestore:   false
    };
  }

  var spent = (client.monthlySpend || {})[key] || 0;
  var pct   = Math.min((spent / tier.monthlyMin) * 100, 100);
  var day   = new Date().getDate();

  /* Day-25 grace-period alert */
  var warn         = day >= 25 && pct < 100;
  /* Early alert: past day 15 in first missed month */
  var earlyWarning = day >= 15 && pct < 100 && !warn;

  /* Demoted state */
  var demoted    = !!client.demoted;
  var canRestore = false;
  var restoreInfo = null;

  if (demoted && client.demotedFrom && client.demotedDate) {
    /* Restoration window: 2 months from demotion date */
    var demotedAt       = new Date(client.demotedDate);
    var restoreDeadline = new Date(demotedAt);
    restoreDeadline.setMonth(restoreDeadline.getMonth() + 2);
    var now = new Date();

    if (now <= restoreDeadline) {
      canRestore = true;
      var prevTier        = getTier(client.demotedFrom);
      var restoreMin      = prevTier.monthlyMin;
      var spentThisMonth  = spent;
      restoreInfo = {
        needed:   restoreMin,
        spent:    spentThisMonth,
        pct:      Math.min((spentThisMonth / restoreMin) * 100, 100),
        deadline: restoreDeadline.toISOString().split('T')[0],
        fromRank: client.demotedFrom
      };
    }
  }

  return {
    ok:           pct >= 100,
    spent:        spent,
    needed:       tier.monthlyMin,
    pct:          pct,
    warn:         warn,
    earlyWarning: earlyWarning,
    demoted:      demoted,
    canRestore:   canRestore,
    restoreInfo:  restoreInfo
  };
}

/*
  Run the monthly maintenance check for a single client.
  Should be called:
   - When admin logs a visit (end of transaction)
   - When admin opens admin panel (to catch stale months)
*/
function runMaintenanceCheck(client) {
  /* Locked VIPs are immune */
  if (client.rankLocked) return;
  /* New clients have no maintenance */
  if (client.rank === 'new') return;

  var tier    = getTier(client.rank);
  if (!tier.monthlyMin) return;

  var key       = monthKey();
  var prevKey   = prevMonthKey();
  var spent     = (client.monthlySpend || {})[key]     || 0;
  var prevSpent = (client.monthlySpend || {})[prevKey] || 0;
  var day       = new Date().getDate();

  /*
    RESTORATION CHECK — must happen before demotion check.
    If demoted and they've met the previous rank's monthly min
    within 2 months of demotion, restore them.
  */
  if (client.demoted && client.demotedFrom && client.demotedDate) {
    var demotedAt       = new Date(client.demotedDate);
    var restoreDeadline = new Date(demotedAt);
    restoreDeadline.setMonth(restoreDeadline.getMonth() + 2);
    var now = new Date();

    if (now <= restoreDeadline) {
      var prevTier   = getTier(client.demotedFrom);
      var restoreMin = prevTier.monthlyMin;
      if (spent >= restoreMin) {
        /* RESTORE */
        client.rank          = client.demotedFrom;
        client.demoted       = false;
        client.demotedFrom   = null;
        client.demotedDate   = null;
        client.missedMonths  = 0;
        if (!client.rankHistory) client.rankHistory = [];
        client.rankHistory.push({
          date:   today(),
          event:  'restored',
          toRank: client.rank
        });
        return; /* nothing else to do */
      }
    } else {
      /* Window expired — demotion is permanent (until new lifetime spend) */
      client.demoted     = false;
      client.demotedFrom = null;
      client.demotedDate = null;
    }
  }

  /*
    MISSED MONTH CHECK
    We track consecutive missed months using client.missedMonths.
    "Missed" = month ended (it's now a new month) and prevMonth < monthlyMin.
    We check this by comparing prevKey spend vs the tier's minimum.
  */
  var prevTierForCheck = getTier(client.rank);
  var prevMissed       = prevSpent < prevTierForCheck.monthlyMin;

  /* Only increment if we're past day 1 (new month just started) */
  var lastCheckedMonth = client.lastMaintCheck || '';
  if (prevKey !== lastCheckedMonth && prevMissed) {
    client.missedMonths = (client.missedMonths || 0) + 1;
    client.lastMaintCheck = prevKey;
  } else if (prevKey !== lastCheckedMonth && !prevMissed) {
    /* Previous month was fine — reset counter */
    client.missedMonths   = 0;
    client.lastMaintCheck = prevKey;
  }

  /*
    DEMOTION: 2 consecutive missed months
  */
  if ((client.missedMonths || 0) >= 2) {
    var currentIdx  = TIERS.findIndex(function (t) { return t.rank === client.rank; });
    var demoteToIdx = currentIdx + 1; /* lower tier = higher array index */

    if (demoteToIdx < TIERS.length - 1) { /* don't go below bronze */
      var newRank          = TIERS[demoteToIdx].rank;
      client.demotedFrom   = client.rank;
      client.rank          = newRank;
      client.demoted       = true;
      client.demotedDate   = today();
      client.missedMonths  = 0;

      if (!client.rankHistory) client.rankHistory = [];
      client.rankHistory.push({
        date:     today(),
        event:    'demoted',
        fromRank: client.demotedFrom,
        toRank:   client.rank
      });
    }
  }
}


/* ══════════════════════════════════════════════════════
   6. DATABASE — localStorage only (host-ready)
══════════════════════════════════════════════════════ */
var STORE_KEY = 'abeenaz_v5';

function defaultDB() {
  return {
    clients: {
      '3001234567': {
        name: 'Zara', pin: null, pinSet: false,
        joinDate: '2024-01-15', birthday: '1995-03-10',
        visits: 12, lifetimeSpend: 24000,
        monthlySpend: {}, loyaltyPoints: 240,
        visitLog: [], redemptionLog: [],
        referredBy: null, referralDiscount: false, referralGiven: false,
        demoted: false, demotedFrom: null, demotedDate: null,
        missedMonths: 0, lastMaintCheck: '', missedLog: [],
        rankLocked: false, rankHistory: [], rankHistory: [],
        notes: '', commissionStaff: ''
      },
      '3119876543': {
        name: 'Hira', pin: null, pinSet: false,
        joinDate: '2024-03-20', birthday: '',
        visits: 5, lifetimeSpend: 11000,
        monthlySpend: {}, loyaltyPoints: 95,
        visitLog: [], redemptionLog: [],
        referredBy: null, referralDiscount: false, referralGiven: false,
        demoted: false, demotedFrom: null, demotedDate: null,
        missedMonths: 0, lastMaintCheck: '', missedLog: [],
        rankLocked: false, rankHistory: [],
        notes: '', commissionStaff: ''
      },
      '3331112222': {
        name: 'Fatima', pin: null, pinSet: false,
        joinDate: '2024-06-01', birthday: '',
        visits: 2, lifetimeSpend: 3200,
        monthlySpend: {}, loyaltyPoints: 12,
        visitLog: [], redemptionLog: [],
        referredBy: null, referralDiscount: false, referralGiven: false,
        demoted: false, demotedFrom: null, demotedDate: null,
        missedMonths: 0, lastMaintCheck: '', missedLog: [],
        rankLocked: false, rankHistory: [],
        notes: '', commissionStaff: ''
      }
    },
    admins: ['3192641891'],
    staff: [
      { id: 's1', name: 'Nadia', role: 'Senior Stylist',  commissionPct: 15, schedule: [] },
      { id: 's2', name: 'Sana',  role: 'Nail Technician', commissionPct: 12, schedule: [] },
      { id: 's3', name: 'Rida',  role: 'Skin Therapist',  commissionPct: 12, schedule: [] }
    ],
    inventory: [
      { id: 'i1', name: 'Keratin Solution',  qty: 3,  lowAt: 2,  unit: 'bottles' },
      { id: 'i2', name: 'Hair Color (Black)', qty: 8,  lowAt: 3,  unit: 'tubes'   },
      { id: 'i3', name: 'Gel Polish Set',     qty: 2,  lowAt: 3,  unit: 'sets'    },
      { id: 'i4', name: 'Facial Oil',         qty: 5,  lowAt: 2,  unit: 'bottles' },
      { id: 'i5', name: 'Wax Strips',         qty: 1,  lowAt: 4,  unit: 'packs'   }
    ],
    config: {
      pointsPerHundred: 1,
      brand:       'Abeenaz',
      tagline:     'where luxury meets you',
      heroTitle:   'Where Every Woman<br/><em>Deserves to Shine</em>',
      heroSub:     'Premium beauty services crafted with care, artistry and the finest products.',
      estYear:     '2023',
      statClients: '500+',
      statExp:     '5+',
      statServices:'30+',
      aboutText:   'Abeenaz was born from a simple belief — every woman deserves to feel extraordinary. Founded in 2023, our parlour has grown into one of the most trusted beauty destinations in the city.\n\nOur team of expert stylists and beauty artists are trained in both classic techniques and modern trends, ensuring every visit is a transformative experience.',
      address:     'Karachi, Pakistan',
      contact:     '+92 319 264 1891',
      hours:       'Mon–Sat, 10am–8pm',
      ctaText:     'Visit us to get registered as a client and unlock exclusive member benefits.',
      vibes: [
        { emoji: '✨', label: 'Radiant',  color: '#c9a84c' },
        { emoji: '💅', label: 'Snatched', color: '#c07070' },
        { emoji: '🌸', label: 'Relaxed',  color: '#8ca8c0' },
        { emoji: '🔥', label: 'Bold',     color: '#c06040' },
        { emoji: '🌿', label: 'Natural',  color: '#70a880' },
        { emoji: '👑', label: 'Royal',    color: '#9070c0' }
      ],
      lookbook: [
        { id: 'lb1', emoji: '💆‍♀️', title: 'Silk Press',       service: 'Keratin Treatment',  price: 6000 },
        { id: 'lb2', emoji: '💅',   title: 'Chrome Nails',     service: 'Gel Nails',           price: 1500 },
        { id: 'lb3', emoji: '✨',   title: 'Glass Skin',       service: 'Gold Facial',         price: 2500 },
        { id: 'lb4', emoji: '💇‍♀️', title: 'Balayage Dream',  service: 'Balayage/Highlights', price: 4000 },
        { id: 'lb5', emoji: '👰',   title: 'Bridal Glow',      service: 'Bridal Makeup',       price: 15000 },
        { id: 'lb6', emoji: '🌸',   title: 'Rose Facial',      service: 'Deep Cleansing',      price: 1800 }
      ]
    },
    services: [
      {
        id: 'hair', name: 'Hair',
        items: [
          { id: 'h1', name: 'Haircut & Styling',    price: 800  },
          { id: 'h2', name: 'Blowout & Blowdry',    price: 600  },
          { id: 'h3', name: 'Hair Color (global)',   price: 2500 },
          { id: 'h4', name: 'Balayage / Highlights', price: 4000 },
          { id: 'h5', name: 'Keratin Treatment',     price: 6000 },
          { id: 'h6', name: 'Hair Spa',              price: 1500 }
        ]
      },
      {
        id: 'skin', name: 'Skin',
        items: [
          { id: 's1', name: 'Basic Facial',          price: 1200 },
          { id: 's2', name: 'Gold Facial',           price: 2500 },
          { id: 's3', name: 'Deep Cleansing',        price: 1800 },
          { id: 's4', name: 'Whitening Facial',      price: 3000 },
          { id: 's5', name: 'Threading (full face)', price: 300  },
          { id: 's6', name: 'Waxing (arms/legs)',    price: 700  }
        ]
      },
      {
        id: 'nails', name: 'Nails',
        items: [
          { id: 'n1', name: 'Manicure',              price: 600  },
          { id: 'n2', name: 'Pedicure',              price: 800  },
          { id: 'n3', name: 'Gel Nails',             price: 1500 },
          { id: 'n4', name: 'Nail Extensions',       price: 2500 },
          { id: 'n5', name: 'Nail Art (per nail)',   price: 100  }
        ]
      },
      {
        id: 'bridal', name: 'Bridal',
        items: [
          { id: 'b1', name: 'Bridal Makeup (full)',  price: 15000 },
          { id: 'b2', name: 'Engagement Makeup',     price: 8000  },
          { id: 'b3', name: 'Mehndi Function Look',  price: 5000  },
          { id: 'b4', name: 'Bridal Hair (updo)',    price: 4000  },
          { id: 'b5', name: 'Pre-Bridal Package',    price: 25000 }
        ]
      }
    ],
    loyaltyShop: [
      { id: 'l1', name: 'Free Basic Facial',        points: 500, desc: 'One complimentary basic facial session' },
      { id: 'l2', name: 'Rs.500 Discount Voucher',  points: 300, desc: 'Off your next visit'                    },
      { id: 'l3', name: 'Free Manicure',            points: 200, desc: 'Classic manicure on the house'          }
    ],
    revenue: {}
  };
}

function loadDB() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through */ }
  return defaultDB();
}

function saveDB() {
  localStorage.setItem(STORE_KEY, JSON.stringify(DB));
}

/* Load and migrate legacy records */
var DB = loadDB();

Object.keys(DB.clients).forEach(function (ph) {
  var c = DB.clients[ph];
  /* Add any missing fields from new schema */
  if (!c.redemptionLog)    c.redemptionLog   = [];
  if (!c.visitLog)         c.visitLog        = [];
  if (!c.monthlySpend)     c.monthlySpend    = {};
  if (!c.rankHistory)      c.rankHistory     = [];
  if (!c.missedLog)        c.missedLog       = [];
  if (c.referredBy       === undefined) c.referredBy       = null;
  if (c.referralDiscount === undefined) c.referralDiscount = false;
  if (c.referralGiven    === undefined) c.referralGiven    = false;
  if (c.demoted          === undefined) c.demoted          = false;
  if (c.demotedFrom      === undefined) c.demotedFrom      = null;
  if (c.demotedDate      === undefined) c.demotedDate      = null;
  if (c.missedMonths     === undefined) c.missedMonths     = 0;
  if (c.lastMaintCheck   === undefined) c.lastMaintCheck   = '';
  if (c.rankLocked       === undefined) c.rankLocked       = false;
  if (c.birthday         === undefined) c.birthday         = '';
  if (c.notes            === undefined) c.notes            = '';
  if (c.commissionStaff  === undefined) c.commissionStaff  = '';
  ensureRank(c);
  /* Run maintenance check on load (catches missed months while offline) */
  runMaintenanceCheck(c);
});

if (!DB.revenue)    DB.revenue    = {};
if (!DB.staff)      DB.staff      = defaultDB().staff;
if (!DB.inventory)  DB.inventory  = defaultDB().inventory;
if (!DB.config.vibes)    DB.config.vibes    = defaultDB().config.vibes;
if (!DB.config.lookbook) DB.config.lookbook = defaultDB().config.lookbook;

saveDB();


/* ══════════════════════════════════════════════════════
   7. APP STATE
══════════════════════════════════════════════════════ */
var currentPhone  = '';
var currentRole   = '';   /* 'admin' | 'client' | 'stranger' */
var pinBuffer     = '';
var newPinBuffer  = '';
var newPinStage   = 'enter';
var newPinFirst   = '';
var isChangingPin = false;
var strangerName  = '';


/* ══════════════════════════════════════════════════════
   8. SCREEN NAVIGATION
══════════════════════════════════════════════════════ */
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  var el = document.getElementById(id);
  el.style.display = 'flex';
  void el.offsetWidth;
  el.classList.add('active');
  if (id === 's-explore') setTimeout(initScrollReveal, 100);
}

function goExplore(from) {
  applyCustomization();
  renderExploreServices();
  renderLoyaltyShop();
  renderVibeSearch();
  renderLookbook();

  var btn = document.getElementById('explore-action-btn');
  if (from === 'guest' || from === 'stranger') {
    btn.textContent = 'Sign In';
    btn.onclick = function () { goScreen('s-welcome'); };
  } else {
    btn.textContent = '← Back';
    btn.onclick = function () { goScreen('s-' + (from === 'admin' ? 'admin' : 'client')); };
  }

  var greetEl = document.getElementById('explore-greeting');
  if (from === 'client') {
    var c = DB.clients[currentPhone];
    greetEl.innerHTML = 'Hello, <span class="gold">' + (c ? c.name : 'Guest') + '</span>';
  } else if (from === 'admin') {
    var a = DB.clients[currentPhone];
    greetEl.innerHTML = 'Admin: <span class="gold">' + (a ? a.name : currentPhone) + '</span>';
  } else if (strangerName) {
    greetEl.innerHTML = 'Hello, <span class="gold">' + strangerName + '</span>';
  } else {
    greetEl.innerHTML = 'Hello, <span class="gold">Guest</span>';
  }

  goScreen('s-explore');
}


/* ══════════════════════════════════════════════════════
   9. TOAST
══════════════════════════════════════════════════════ */
var toastTimer;

function showToast(msg, type) {
  type = type || '';
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3800);
}


/* ══════════════════════════════════════════════════════
   10. PHONE ENTRY
══════════════════════════════════════════════════════ */
function handlePhone() {
  var raw = document.getElementById('inp-phone').value.trim().replace(/\D/g, '');
  if (raw.length !== 10) {
    showToast('Please enter a valid 10-digit number', 'error');
    return;
  }
  currentPhone = raw;

  if (DB.admins.indexOf(currentPhone) !== -1) {
    currentRole = 'admin';
    openPinScreen();
    return;
  }
  if (DB.clients[currentPhone]) {
    currentRole = 'client';
    openPinScreen();
    return;
  }

  /* Stranger */
  currentRole = 'stranger';
  document.getElementById('stranger-chat-msg').textContent =
    'Hello! +92 ' + currentPhone + ' isn\'t in our client list yet. ' +
    'Explore what Abeenaz has to offer and visit us soon! 💛';
  document.getElementById('inp-stranger-name').value = '';
  goScreen('s-stranger');
}


/* ══════════════════════════════════════════════════════
   11. PIN SCREEN
══════════════════════════════════════════════════════ */
function openPinScreen() {
  pinBuffer = '';
  updatePinDots(pinBuffer, 'pd');

  if (currentRole === 'admin') {
    document.getElementById('pin-avatar').textContent = '🔑';
    document.getElementById('pin-title').textContent  = 'Admin Access';
    document.getElementById('pin-desc').textContent   = 'Enter your PIN to manage Abeenaz';
  } else {
    var c = DB.clients[currentPhone];
    document.getElementById('pin-avatar').textContent = c.name ? c.name[0].toUpperCase() : 'A';
    document.getElementById('pin-title').textContent  = c.name ? 'Hello, ' + c.name + ' ✦' : 'Welcome Back';
    document.getElementById('pin-desc').textContent   = c.pinSet
      ? 'Enter your personal PIN'
      : 'Default PIN: last 4 digits of your number';
  }
  goScreen('s-pin');
}

function numPress(d) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += d;
  updatePinDots(pinBuffer, 'pd');
  if (pinBuffer.length === 4) setTimeout(checkPin, 220);
}

function delPin()   { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(pinBuffer, 'pd'); }
function clearPin() { pinBuffer = '';                     updatePinDots(pinBuffer, 'pd'); }

function checkPin() {
  var entered = pinBuffer;
  pinBuffer   = '';

  if (currentRole === 'admin') {
    var cd       = DB.clients[currentPhone];
    var validPin = (cd && cd.pin) ? cd.pin : currentPhone.slice(-4);
    if (entered === validPin) {
      showToast('Admin access granted ✦', 'success');
      setTimeout(loadAdminPanel, 600);
    } else {
      shakePinRow('pd');
      showToast('Incorrect PIN', 'error');
    }
    updatePinDots(pinBuffer, 'pd');
    return;
  }

  var c        = DB.clients[currentPhone];
  var validPin = c.pin ? c.pin : currentPhone.slice(-4);

  if (entered !== validPin) {
    shakePinRow('pd');
    showToast('Incorrect PIN. Try again.', 'error');
    updatePinDots(pinBuffer, 'pd');
    return;
  }

  if (!c.pinSet) {
    isChangingPin = false;
    openNewPinFlow();
    return;
  }

  loadClientDash();
  updatePinDots(pinBuffer, 'pd');
}


/* ══════════════════════════════════════════════════════
   12. SET / CHANGE PIN
══════════════════════════════════════════════════════ */
function goUpdatePin() { isChangingPin = true; openNewPinFlow(); }

function openNewPinFlow() {
  newPinBuffer = '';
  newPinStage  = 'enter';
  newPinFirst  = '';
  updatePinDots(newPinBuffer, 'npd');
  document.getElementById('newpin-step-badge').textContent = 'Step 1 of 2';
  document.getElementById('newpin-title').textContent = isChangingPin ? 'Change Your PIN' : 'Set Your PIN';
  document.getElementById('newpin-desc').textContent  = 'Choose a new 4-digit PIN (not your last 4 phone digits)';
  goScreen('s-newpin');
}

function newNumPress(d) {
  if (newPinBuffer.length >= 4) return;
  newPinBuffer += d;
  updatePinDots(newPinBuffer, 'npd');
  if (newPinBuffer.length === 4) setTimeout(processNewPin, 220);
}

function delNewPin()   { newPinBuffer = newPinBuffer.slice(0, -1); updatePinDots(newPinBuffer, 'npd'); }
function clearNewPin() { newPinBuffer = '';                        updatePinDots(newPinBuffer, 'npd'); }

function processNewPin() {
  var entered = newPinBuffer;
  var defPin  = currentPhone.slice(-4);

  if (newPinStage === 'enter') {
    if (entered === defPin) {
      showToast('PIN cannot match your last 4 phone digits', 'error');
      newPinBuffer = '';
      updatePinDots(newPinBuffer, 'npd');
      return;
    }
    newPinFirst  = entered;
    newPinBuffer = '';
    newPinStage  = 'confirm';
    document.getElementById('newpin-step-badge').textContent = 'Step 2 of 2';
    document.getElementById('newpin-title').textContent = 'Confirm PIN';
    document.getElementById('newpin-desc').textContent  = 'Re-enter your new PIN to confirm';
    updatePinDots(newPinBuffer, 'npd');

  } else {
    if (entered !== newPinFirst) {
      showToast("PINs don't match. Try again.", 'error');
      shakePinRow('npd');
      newPinBuffer = ''; newPinStage = 'enter'; newPinFirst = '';
      document.getElementById('newpin-step-badge').textContent = 'Step 1 of 2';
      document.getElementById('newpin-title').textContent = 'Create Your PIN';
      document.getElementById('newpin-desc').textContent  = 'Choose a new 4-digit PIN';
      updatePinDots(newPinBuffer, 'npd');
    } else {
      if (!DB.clients[currentPhone]) {
        DB.clients[currentPhone] = {
          name: null, pin: entered, pinSet: true,
          joinDate: today(), birthday: '',
          visits: 0, lifetimeSpend: 0,
          monthlySpend: {}, loyaltyPoints: 0,
          visitLog: [], redemptionLog: [],
          referredBy: null, referralDiscount: false, referralGiven: false,
          demoted: false, demotedFrom: null, demotedDate: null,
          missedMonths: 0, lastMaintCheck: '', missedLog: [],
          rankLocked: false, rankHistory: [], notes: '', commissionStaff: ''
        };
      } else {
        DB.clients[currentPhone].pin    = entered;
        DB.clients[currentPhone].pinSet = true;
      }
      ensureRank(DB.clients[currentPhone]);
      saveDB();
      showToast('PIN saved successfully! ✦', 'success');
      setTimeout(function () {
        if (currentRole === 'admin') { loadAdminPanel(); return; }
        loadClientDash();
      }, 700);
    }
  }
}


/* ══════════════════════════════════════════════════════
   13. STRANGER FLOW
══════════════════════════════════════════════════════ */
function saveStrangerName() {
  var n = document.getElementById('inp-stranger-name').value.trim();
  strangerName = n || 'Guest';
  showToast(n ? 'Welcome, ' + n + '! Explore Abeenaz ✨' : 'Welcome! Explore Abeenaz ✨', 'success');
  setTimeout(function () { goExplore('stranger'); }, 500);
}


/* ══════════════════════════════════════════════════════
   14. CLIENT DASHBOARD
══════════════════════════════════════════════════════ */
function loadClientDash() {
  var c   = DB.clients[currentPhone];
  var key = monthKey();

  /* Sync rank + run maintenance check every time they log in */
  ensureRank(c);
  runMaintenanceCheck(c);
  saveDB();

  var tier         = getTier(c.rank);
  var maint        = maintenanceStatus(c);
  var monthlySpent = (c.monthlySpend || {})[key] || 0;

  /* Rank labels */
  var rankLabels = {
    diamond: '💎 Diamond Client',
    gold:    '⭐ Gold Client',
    silver:  '🥈 Silver Client',
    bronze:  '🥉 Bronze Client',
    new:     '🆕 New Client'
  };
  var rankLabel = rankLabels[c.rank] || '• Client';

  /* Fill fields */
  document.getElementById('dash-name').textContent    = c.name || 'Client';
  document.getElementById('rank-pill').textContent    = rankLabel;
  document.getElementById('di-phone').textContent     = '+92 ' + currentPhone;
  document.getElementById('di-rank').textContent      = rankLabel + (c.rankLocked ? ' 🔒' : '');
  document.getElementById('di-since').textContent     = c.joinDate || '—';
  document.getElementById('di-visits').textContent    = (c.visits || 0) + ' visits';
  document.getElementById('di-lifetime').textContent  = 'Rs. ' + fmt(c.lifetimeSpend || 0);
  document.getElementById('di-monthly').textContent   = 'Rs. ' + fmt(monthlySpent) + ' this month';
  document.getElementById('di-discount').textContent  = tier.discount
    ? (tier.discount * 100) + '% off on all services'
    : 'No discount yet';
  document.getElementById('di-points').textContent    = fmt(c.loyaltyPoints || 0);
  document.getElementById('di-diamond-note').style.display = c.rank === 'diamond' ? 'block' : 'none';

  /* Birthday discount note */
  var bdayEl = document.getElementById('di-birthday-note');
  if (bdayEl) {
    bdayEl.style.display = (c.rank === 'diamond' && c.birthday) ? 'block' : 'none';
    if (c.rank === 'diamond' && c.birthday) {
      bdayEl.textContent = '🎂 Birthday month bonus: extra 5% off!';
    }
  }

  /* Referral badge */
  var refRow = document.getElementById('di-referral-row');
  if (refRow) {
    if (c.referralDiscount) {
      refRow.style.display = 'flex';
      document.getElementById('di-referral-txt').textContent = '10% off your next visit (referral bonus)!';
    } else {
      refRow.style.display = 'none';
    }
  }

  /* ── Maintenance warning bar (multi-state) ── */
  var warnBar = document.getElementById('maint-warning');
  if (warnBar) {
    if (c.demoted) {
      warnBar.style.display = 'block';
      warnBar.className     = 'maint-warning demoted';
      var restoreMsg = '';
      if (maint.canRestore && maint.restoreInfo) {
        var ri = maint.restoreInfo;
        restoreMsg = ' · Spend Rs.' + fmt(ri.needed) + '/mo before ' + ri.deadline + ' to restore ' + cap(ri.fromRank) + '!';
      }
      warnBar.textContent = '⬇️ Rank dropped to ' + cap(c.rank) + ' after 2 missed months.' + restoreMsg;

    } else if (maint.warn) {
      warnBar.style.display = 'block';
      warnBar.className     = 'maint-warning grace';
      var remaining = maint.needed - maint.spent;
      warnBar.textContent = '⚡ Day-25 Alert: Spend Rs.' + fmt(remaining) + ' more this month to keep ' + cap(c.rank) + ' rank!';

    } else if (maint.earlyWarning && c.rank !== 'new') {
      warnBar.style.display = 'block';
      warnBar.className     = 'maint-warning early';
      warnBar.textContent   = '📅 Past day 15 — Rs.' + fmt(monthlySpent) + ' / Rs.' + fmt(maint.needed) + ' this month (' + Math.round(maint.pct) + '%)';

    } else if (!maint.ok && c.rank !== 'new') {
      warnBar.style.display = 'block';
      warnBar.className     = 'maint-warning';
      warnBar.textContent   = '⚠️ Monthly: Rs.' + fmt(monthlySpent) + ' / Rs.' + fmt(maint.needed) + ' needed (' + Math.round(maint.pct) + '%)';

    } else {
      warnBar.style.display = 'none';
    }
  }

  /* ── Maintenance ring (SVG donut) ── */
  renderMaintenanceRing('client-maint-ring', maint.pct, c.rank, c.demoted);

  /* ── Rank progress bar toward next tier ── */
  var nextTierIdx = TIERS.findIndex(function (t) { return t.rank === c.rank; }) - 1;
  var fillEl      = document.getElementById('di-progress-fill');
  var labelEl     = document.getElementById('di-progress-lbl');

  if (fillEl && labelEl) {
    if (nextTierIdx >= 0) {
      var nextTier = TIERS[nextTierIdx];
      var pct = Math.min(
        ((c.lifetimeSpend - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100,
        100
      );
      fillEl.style.width  = pct + '%';
      labelEl.textContent = 'Rs.' + fmt(c.lifetimeSpend) + ' / Rs.' + fmt(nextTier.threshold) + ' → ' + nextTier.label;
    } else {
      fillEl.style.width  = '100%';
      labelEl.textContent = '💎 Diamond — Top Tier Achieved!';
    }
  }

  /* ── Visit history ── */
  var vListEl = document.getElementById('di-visit-history');
  if (vListEl) {
    var log = (c.visitLog || []).slice().reverse();
    if (!log.length) {
      vListEl.innerHTML = '<div class="empty-state">No visits recorded yet</div>';
    } else {
      vListEl.innerHTML = log.map(function (v) {
        return '<div class="visit-entry">' +
          '<div class="ve-left">' +
            '<div class="ve-date">' + v.date + '</div>' +
            '<div class="ve-note">' + (v.note || 'Parlour visit') + (v.refDiscount ? ' 🎁' : '') + '</div>' +
          '</div>' +
          '<div class="ve-right">' +
            '<div class="ve-spend">Rs. ' + fmt(v.spend) + '</div>' +
            '<div class="ve-pts">+' + v.pts + ' pts</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  showToast('Welcome back, ' + (c.name || 'Client') + '! ✨', 'success');
  goScreen('s-client');
}


/* ══════════════════════════════════════════════════════
   15. MAINTENANCE RING — SVG donut renderer
   ─────────────────────────────────────────────────────
   Draws an animated circular progress ring showing
   how much of the monthly maintenance has been met.
   color changes: green → gold → orange → red
══════════════════════════════════════════════════════ */
function renderMaintenanceRing(containerId, pct, rank, demoted) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var size   = 120;
  var radius = 48;
  var cx     = size / 2;
  var cy     = size / 2;
  var circum = 2 * Math.PI * radius;
  var fill   = Math.max(0, Math.min(pct, 100));
  var dash   = (fill / 100) * circum;
  var gap    = circum - dash;

  /* Color based on percentage */
  var color;
  if (demoted)     color = '#c07070';
  else if (fill >= 100) color = '#70c090';
  else if (fill >= 60)  color = '#c9a84c';
  else if (fill >= 30)  color = '#c08040';
  else                  color = '#c07070';

  el.innerHTML =
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      /* Track */
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '"' +
        ' fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>' +
      /* Progress arc */
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '"' +
        ' fill="none"' +
        ' stroke="' + color + '"' +
        ' stroke-width="8"' +
        ' stroke-linecap="round"' +
        ' stroke-dasharray="' + dash + ' ' + gap + '"' +
        ' transform="rotate(-90 ' + cx + ' ' + cy + ')"' +
        ' style="transition:stroke-dasharray 1s ease;"/>' +
      /* Centre text */
      '<text x="' + cx + '" y="' + (cy + 5) + '"' +
        ' text-anchor="middle" font-family="Playfair Display,serif"' +
        ' font-size="18" fill="' + color + '">' +
        Math.round(fill) + '%' +
      '</text>' +
      '<text x="' + cx + '" y="' + (cy + 20) + '"' +
        ' text-anchor="middle" font-family="Jost,sans-serif"' +
        ' font-size="9" fill="rgba(255,255,255,0.4)">' +
        (demoted ? 'DEMOTED' : 'MONTHLY') +
      '</text>' +
    '</svg>';
}


/* ══════════════════════════════════════════════════════
   16. ADMIN PANEL — LOAD
══════════════════════════════════════════════════════ */
function loadAdminPanel() {
  var cd = DB.clients[currentPhone];
  if (!cd || !cd.pinSet) {
    isChangingPin = false;
    setTimeout(function () {
      showToast('Please set your admin PIN first', 'error');
      openNewPinFlow();
    }, 400);
    return;
  }

  document.getElementById('admin-name').textContent =
    (cd.name || 'Admin') + ' · +92 ' + currentPhone;

  /* Run maintenance checks for all clients on panel load */
  Object.keys(DB.clients).forEach(function (ph) {
    ensureRank(DB.clients[ph]);
    runMaintenanceCheck(DB.clients[ph]);
  });
  saveDB();

  refreshAdminStats();
  renderClientList();
  renderAdminList();
  renderAlerts();
  renderServicesAdmin();
  renderShopAdmin();
  renderRevenuePanel();
  renderInventoryPanel();
  renderStaffPanel();
  renderLookbookAdmin();
  loadCustomFields();
  renderServiceSelectOptions();
  renderStaffSelectOptions();
  goScreen('s-admin');
}

/* Admin stats bar */
function refreshAdminStats() {
  var clients = Object.values(DB.clients);
  var atRisk  = clients.filter(function (c) {
    var m = maintenanceStatus(c);
    return (!m.ok || c.demoted) && c.rank !== 'new';
  }).length;

  document.getElementById('stat-total').textContent     = clients.length;
  document.getElementById('stat-diamond').textContent   = clients.filter(function (c) { return c.rank === 'diamond'; }).length;
  document.getElementById('stat-gold').textContent      = clients.filter(function (c) { return c.rank === 'gold'; }).length;
  document.getElementById('stat-silver').textContent    = clients.filter(function (c) { return c.rank === 'silver'; }).length;
  document.getElementById('stat-referrals').textContent = clients.filter(function (c) { return c.referredBy; }).length;
  document.getElementById('stat-at-risk').textContent   = atRisk;
}

/* ── Client list ── */
function renderClientList() {
  var el    = document.getElementById('admin-client-list');
  var cnt   = document.getElementById('clients-count');
  var query = (document.getElementById('client-search')
    ? document.getElementById('client-search').value : '').toLowerCase();

  var entries = Object.entries(DB.clients);
  if (query) {
    entries = entries.filter(function (pair) {
      return pair[0].includes(query) || (pair[1].name || '').toLowerCase().includes(query);
    });
  }
  cnt.textContent = Object.keys(DB.clients).length;

  if (!entries.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:.5rem 0;">No clients found</div>';
    return;
  }

  el.innerHTML = entries.map(function (pair) {
    var phone  = pair[0];
    var d      = pair[1];
    var m      = maintenanceStatus(d);
    var atRisk = (!m.ok || d.demoted) && d.rank !== 'new';

    var tags = '';
    if (atRisk)             tags += ' <span class="risk-tag">' + (d.demoted ? '⬇ Demoted' : '⚠') + '</span>';
    if (d.referralDiscount) tags += ' <span class="ref-tag">🎁</span>';
    if (d.rankLocked)       tags += ' <span class="lock-tag">🔒 VIP</span>';

    return '<div class="admin-item ' + (atRisk ? 'at-risk' : '') + '" onclick="openClientModal(\'' + phone + '\')">' +
      '<div>' +
        '<div class="a-name">' + (d.name || '(No name)') + tags + '</div>' +
        '<div class="a-phone">+92 ' + phone + ' · ' + (d.visits || 0) + ' visits · Rs.' + fmt(d.lifetimeSpend || 0) + '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:.5rem;">' +
        '<div id="ring-' + phone + '"></div>' +
        '<span class="a-rank ' + (d.rank || 'new') + '">' + rankEmoji(d.rank) + ' ' + cap(d.rank || 'new') + '</span>' +
        '<button class="rm-btn" onclick="event.stopPropagation();removeClient(\'' + phone + '\')">✕</button>' +
      '</div>' +
    '</div>';
  }).join('');

  /* Render mini rings for each client row */
  entries.forEach(function (pair) {
    var phone = pair[0];
    var d     = pair[1];
    var m     = maintenanceStatus(d);
    var mini  = document.getElementById('ring-' + phone);
    if (mini) renderMaintenanceRingMini(mini, m.pct, d.rank, d.demoted);
  });
}

/* Mini ring (32px) for client list */
function renderMaintenanceRingMini(el, pct, rank, demoted) {
  var size   = 32;
  var radius = 12;
  var cx = size / 2, cy = size / 2;
  var circum = 2 * Math.PI * radius;
  var fill   = Math.max(0, Math.min(pct, 100));
  var dash   = (fill / 100) * circum;
  var gap    = circum - dash;
  var color  = demoted ? '#c07070' : (fill >= 100 ? '#70c090' : (fill >= 60 ? '#c9a84c' : '#c07070'));

  el.innerHTML =
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="3"' +
        ' stroke-dasharray="' + dash + ' ' + gap + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' +
    '</svg>';
}

/* ── Admin list ── */
function renderAdminList() {
  var el  = document.getElementById('admin-admin-list');
  var cnt = document.getElementById('admins-count');
  cnt.textContent = DB.admins.length;

  el.innerHTML = DB.admins.length
    ? DB.admins.map(function (phone) {
        return '<div class="admin-item">' +
          '<div>' +
            '<div class="a-name">' + (DB.clients[phone] ? DB.clients[phone].name || 'Admin' : 'Admin') + '</div>' +
            '<div class="a-phone">+92 ' + phone + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:.5rem;">' +
            '<span class="a-rank admin">🔑 Admin</span>' +
            '<button class="rm-btn" onclick="removeAdmin(\'' + phone + '\')">✕</button>' +
          '</div>' +
        '</div>';
      }).join('')
    : '<div style="color:var(--muted);font-size:.82rem;">No admins</div>';
}

/* ── Maintenance alerts ── */
function renderAlerts() {
  var el     = document.getElementById('alerts-list');
  var atRisk = Object.entries(DB.clients).filter(function (pair) {
    var m = maintenanceStatus(pair[1]);
    return (!m.ok || pair[1].demoted || m.earlyWarning) && pair[1].rank !== 'new';
  });

  if (!atRisk.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:.5rem;">✅ All clients are on track!</div>';
    return;
  }

  el.innerHTML = atRisk.map(function (pair) {
    var phone = pair[0];
    var d     = pair[1];
    var m     = maintenanceStatus(d);
    var msg   = '';
    var cls   = 'at-risk';

    if (d.demoted) {
      cls = 'at-risk demoted-row';
      msg = '⬇️ DEMOTED — was ' + cap(d.demotedFrom) + '. ';
      if (m.canRestore && m.restoreInfo) {
        msg += 'Restore by spending Rs.' + fmt(m.restoreInfo.needed) + '/mo before ' + m.restoreInfo.deadline;
      }
    } else if (m.warn) {
      msg = '⚡ Day-25 Grace Alert — Rs.' + fmt(m.needed - m.spent) + ' remaining';
    } else if (m.earlyWarning) {
      msg = '📅 Past Day 15 — ' + Math.round(m.pct) + '% of maintenance met';
    } else {
      msg = '⚠ Rs.' + fmt(m.spent) + ' / Rs.' + fmt(m.needed) + ' (' + Math.round(m.pct) + '%)';
    }

    return '<div class="admin-item ' + cls + '">' +
      '<div>' +
        '<div class="a-name">' + (d.name || '(No name)') + '</div>' +
        '<div class="a-phone">+92 ' + phone + ' · ' + msg + '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:.4rem;">' +
        '<span class="a-rank ' + d.rank + '">' + rankEmoji(d.rank) + ' ' + cap(d.rank) + '</span>' +
        '<button class="wa-btn" onclick="sendWhatsAppAlert(\'' + phone + '\',\'' + (d.name || 'Client') + '\',\'' + d.rank + '\',' + m.spent + ',' + m.needed + ')">📲 WhatsApp</button>' +
      '</div>' +
    '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════
   17. ADD / REMOVE CLIENTS & ADMINS
══════════════════════════════════════════════════════ */
function addClient() {
  var phone  = document.getElementById('inp-add-phone').value.trim().replace(/\D/g, '');
  var name   = (document.getElementById('inp-add-name').value || '').trim();
  var refPh  = (document.getElementById('inp-add-referrer').value || '').trim().replace(/\D/g, '');
  var bday   = (document.getElementById('inp-add-bday').value || '').trim();

  if (phone.length !== 10) { showToast('Enter a valid 10-digit number', 'error'); return; }
  if (DB.clients[phone])   { showToast('Already a registered client', 'error');   return; }
  if (!name)               { showToast('Please enter a client name', 'error');     return; }

  var refApplied = false;
  if (refPh && refPh.length === 10) {
    if (DB.clients[refPh]) {
      DB.clients[refPh].referralDiscount = true;
      DB.clients[refPh].referralGiven    = false;
      refApplied = true;
    } else {
      showToast('Referrer +92' + refPh + ' not found — adding without referral', 'error');
    }
  }

  DB.clients[phone] = {
    name: name, pin: null, pinSet: false,
    joinDate: today(), birthday: bday,
    visits: 0, lifetimeSpend: 0,
    monthlySpend: {}, loyaltyPoints: 0,
    visitLog: [], redemptionLog: [],
    referredBy: refApplied ? refPh : null,
    referralDiscount: refApplied,
    referralGiven: false,
    demoted: false, demotedFrom: null, demotedDate: null,
    missedMonths: 0, lastMaintCheck: '', missedLog: [],
    rankLocked: false, rankHistory: [], notes: '', commissionStaff: ''
  };
  ensureRank(DB.clients[phone]);
  saveDB();

  document.getElementById('inp-add-phone').value    = '';
  document.getElementById('inp-add-name').value     = '';
  document.getElementById('inp-add-referrer').value = '';
  document.getElementById('inp-add-bday').value     = '';
  document.getElementById('referrer-lookup').style.display = 'none';

  showToast(name + ' added ✦' + (refApplied ? ' · Referral bonus active!' : ''), 'success');
  renderClientList();
  refreshAdminStats();
  switchATab(document.querySelector('[data-tab="clients"]'), 'clients');
}

function removeClient(phone) {
  if (!confirm('Remove +92' + phone + '?')) return;
  delete DB.clients[phone];
  saveDB();
  renderClientList();
  refreshAdminStats();
  renderAlerts();
  showToast('Client removed', '');
}

function addAdmin() {
  var phone = document.getElementById('inp-add-admin').value.trim().replace(/\D/g, '');
  if (phone.length !== 10)             { showToast('Enter a valid 10-digit number', 'error'); return; }
  if (DB.admins.indexOf(phone) !== -1) { showToast('Already an admin', 'error');              return; }
  DB.admins.push(phone);
  saveDB();
  renderAdminList();
  document.getElementById('inp-add-admin').value = '';
  showToast('+92' + phone + ' granted admin access ✦', 'success');
}

function removeAdmin(phone) {
  if (phone === currentPhone) { showToast("You can't remove yourself", 'error'); return; }
  if (!confirm('Remove admin +92' + phone + '?')) return;
  DB.admins = DB.admins.filter(function (p) { return p !== phone; });
  saveDB();
  renderAdminList();
  showToast('Admin removed', '');
}


/* ══════════════════════════════════════════════════════
   18. CLIENT DETAIL MODAL
══════════════════════════════════════════════════════ */
function openClientModal(phone) {
  var d = DB.clients[phone];
  if (!d) return;

  var tier         = getTier(d.rank);
  var m            = maintenanceStatus(d);
  var key          = monthKey();
  var monthlySpent = (d.monthlySpend || {})[key] || 0;
  var log          = (d.visitLog      || []).slice().reverse().slice(0, 10);
  var redLog       = (d.redemptionLog || []).slice().reverse().slice(0,  5);
  var rankLog      = (d.rankHistory   || []).slice().reverse().slice(0,  5);

  /* Warning / demotion banners */
  var warnHtml = '';
  if (d.demoted) {
    warnHtml = '<div class="modal-warning demoted-banner">' +
      '⬇️ Demoted from ' + cap(d.demotedFrom) + ' on ' + d.demotedDate + '.' +
      (m.canRestore && m.restoreInfo
        ? ' Restore by spending Rs.' + fmt(m.restoreInfo.needed) + '/mo before ' + m.restoreInfo.deadline + '.'
        : ' Restoration window expired.') +
      '</div>';
  } else if (m.warn) {
    warnHtml = '<div class="modal-warning grace-banner">' +
      '⚡ Day-25 alert! Rs.' + fmt(m.needed - m.spent) + ' more needed this month.' +
    '</div>';
  } else if (m.earlyWarning) {
    warnHtml = '<div class="modal-warning early-banner">' +
      '📅 Past day 15 · ' + Math.round(m.pct) + '% of maintenance met.' +
    '</div>';
  } else if (!m.ok && d.rank !== 'new') {
    warnHtml = '<div class="modal-warning">' +
      '⚠️ Rs.' + fmt(m.spent) + ' / Rs.' + fmt(m.needed) + ' this month.' +
      '<div class="rank-progress-bar" style="margin-top:.4rem;">' +
        '<div class="rank-progress-fill" style="width:' + m.pct + '%;background:var(--rose);"></div>' +
      '</div>' +
    '</div>';
  }

  /* Referral badge */
  var refHtml = d.referralDiscount
    ? '<div class="modal-ref-badge">🎁 Referral discount active — 10% off next visit</div>'
    : '';

  /* Visit rows */
  var visitRows = log.length
    ? log.map(function (v) {
        return '<div class="visit-entry">' +
          '<div class="ve-left"><div class="ve-date">' + v.date + '</div><div class="ve-note">' + (v.note || 'Parlour visit') + (v.refDiscount ? ' 🎁' : '') + '</div></div>' +
          '<div class="ve-right"><div class="ve-spend">Rs.' + fmt(v.spend) + '</div><div class="ve-pts">+' + v.pts + ' pts</div></div>' +
        '</div>';
      }).join('')
    : '<div class="empty-state">No visits yet</div>';

  /* Redemption rows */
  var redemptRows = redLog.length
    ? redLog.map(function (r) {
        return '<div class="visit-entry">' +
          '<div class="ve-left"><div class="ve-date">' + r.date + '</div><div class="ve-note">🎁 ' + r.item + '</div></div>' +
          '<div class="ve-right"><div class="ve-spend" style="color:var(--rose);">−' + fmt(r.points) + ' pts</div></div>' +
        '</div>';
      }).join('')
    : '<div class="empty-state">No redemptions</div>';

  /* Rank history rows */
  var rankRows = rankLog.length
    ? rankLog.map(function (r) {
        var icon = r.event === 'demoted' ? '⬇️' : (r.event === 'restored' ? '⬆️' : '🏆');
        return '<div class="visit-entry">' +
          '<div class="ve-left"><div class="ve-date">' + r.date + '</div><div class="ve-note">' + icon + ' ' + cap(r.event) + (r.fromRank ? ' from ' + cap(r.fromRank) : '') + ' → ' + cap(r.toRank) + '</div></div>' +
        '</div>';
      }).join('')
    : '<div class="empty-state">No rank events</div>';

  document.getElementById('modal-content').innerHTML =
    /* Header */
    '<div class="modal-header">' +
      '<div class="modal-avatar">' + (d.name ? d.name[0].toUpperCase() : '?') + '</div>' +
      '<div>' +
        '<h3 class="modal-title">' + (d.name || '(No name)') + (d.rankLocked ? ' 🔒' : '') + '</h3>' +
        '<p style="color:var(--muted);font-size:.78rem;">+92 ' + phone + ' · Since ' + (d.joinDate || '—') + (d.birthday ? ' · 🎂 ' + d.birthday : '') + '</p>' +
        (d.referredBy ? '<p style="color:var(--gold);font-size:.72rem;">🎁 Referred by +92 ' + d.referredBy + '</p>' : '') +
      '</div>' +
      '<div id="modal-maint-ring" style="margin-left:auto;"></div>' +
    '</div>' +

    /* Stats grid */
    '<div class="modal-grid">' +
      '<div class="modal-stat"><span class="ms-val">Rs.' + fmt(d.lifetimeSpend || 0) + '</span><span class="ms-lbl">Lifetime</span></div>' +
      '<div class="modal-stat"><span class="ms-val">Rs.' + fmt(monthlySpent) + '</span><span class="ms-lbl">This Month</span></div>' +
      '<div class="modal-stat"><span class="ms-val">' + (d.visits || 0) + '</span><span class="ms-lbl">Visits</span></div>' +
      '<div class="modal-stat"><span class="ms-val gold">' + fmt(d.loyaltyPoints || 0) + '</span><span class="ms-lbl">Points</span></div>' +
      '<div class="modal-stat"><span class="ms-val">' + (tier.discount ? (tier.discount * 100) + '%' : '0%') + '</span><span class="ms-lbl">Discount</span></div>' +
      '<div class="modal-stat"><span class="ms-val">' + (d.rank === 'diamond' ? '1.1×' : '1.0×') + '</span><span class="ms-lbl">Pts Mult.</span></div>' +
    '</div>' +

    refHtml + warnHtml +

    /* Manual Override Controls */
    '<div class="modal-override">' +
      '<div class="override-title">⚙️ Admin Controls</div>' +
      '<div class="override-grid">' +
        /* Edit name */
        '<div class="field" style="grid-column:1/-1;">' +
          '<label class="field-label">Name</label>' +
          '<div style="display:flex;gap:.5rem;">' +
            '<input type="text" id="modal-name-inp" class="field-input" value="' + (d.name || '') + '" style="flex:1;"/>' +
            '<button class="btn-primary" style="flex-shrink:0;padding:.55rem .9rem;font-size:.78rem;" onclick="saveClientName(\'' + phone + '\')">Save</button>' +
          '</div>' +
        '</div>' +
        /* Birthday */
        '<div class="field">' +
          '<label class="field-label">Birthday (YYYY-MM-DD)</label>' +
          '<input type="text" id="modal-bday-inp" class="field-input" value="' + (d.birthday || '') + '" placeholder="1995-03-10"/>' +
        '</div>' +
        /* Notes */
        '<div class="field">' +
          '<label class="field-label">Notes</label>' +
          '<input type="text" id="modal-notes-inp" class="field-input" value="' + (d.notes || '') + '" placeholder="VIP, allergies…"/>' +
        '</div>' +
        /* Grant points */
        '<div class="field">' +
          '<label class="field-label">Grant Points</label>' +
          '<div style="display:flex;gap:.5rem;">' +
            '<input type="number" id="modal-pts-inp" class="field-input" placeholder="e.g. 200" min="1"/>' +
            '<button class="btn-primary" style="flex-shrink:0;padding:.55rem .9rem;font-size:.78rem;" onclick="grantPoints(\'' + phone + '\')">Grant</button>' +
          '</div>' +
        '</div>' +
        /* Lock rank */
        '<div style="display:flex;align-items:center;gap:.7rem;padding:.5rem 0;">' +
          '<label class="field-label" style="margin:0;">🔒 Lock Rank (VIP)</label>' +
          '<input type="checkbox" id="modal-lock-inp" ' + (d.rankLocked ? 'checked' : '') + ' onchange="toggleRankLock(\'' + phone + '\',this.checked)" style="width:18px;height:18px;accent-color:var(--gold);cursor:pointer;"/>' +
        '</div>' +
      '</div>' +
      '<button class="btn-primary" style="margin-top:.8rem;" onclick="saveModalOverrides(\'' + phone + '\')">💾 Save Changes</button>' +
    '</div>' +

    '<div class="modal-section-title">Recent Visits</div>'     + visitRows   +
    '<div class="modal-section-title" style="margin-top:1rem;">Loyalty Redemptions</div>' + redemptRows +
    '<div class="modal-section-title" style="margin-top:1rem;">Rank History</div>'        + rankRows    +

    '<div style="display:flex;gap:.7rem;margin-top:1.2rem;flex-wrap:wrap;">' +
      '<button class="btn-primary" style="flex:1;" onclick="prefillVisit(\'' + phone + '\')">📋 Log Visit</button>' +
      '<button class="wa-btn" style="flex:1;padding:.7rem 1rem;" onclick="sendWhatsAppAlert(\'' + phone + '\',\'' + (d.name || 'Client') + '\',\'' + d.rank + '\',' + monthlySpent + ',' + (m.needed || 0) + ')">📲 WhatsApp</button>' +
    '</div>';

  document.getElementById('modal-overlay').style.display = 'block';
  document.getElementById('client-modal').classList.add('open');

  /* Render ring inside modal */
  renderMaintenanceRing('modal-maint-ring', m.pct, d.rank, d.demoted);
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('client-modal').classList.remove('open');
}

function prefillVisit(phone) {
  closeModal();
  switchATab(document.querySelector('[data-tab="visit"]'), 'visit');
  document.getElementById('inp-visit-phone').value = phone;
  liveClientLookup();
}

function saveClientName(phone) {
  var n = (document.getElementById('modal-name-inp').value || '').trim();
  if (!n) { showToast('Enter a name', 'error'); return; }
  DB.clients[phone].name = n;
  saveDB();
  /* Update the modal title live so user sees the change immediately */
  var titleEl = document.querySelector('#client-modal .modal-title');
  if (titleEl) titleEl.textContent = n + (DB.clients[phone].rankLocked ? ' 🔒' : '');
  /* Update the modal avatar initial */
  var avatarEl = document.querySelector('#client-modal .modal-avatar');
  if (avatarEl) avatarEl.textContent = n[0].toUpperCase();
  /* Refresh admin list in background */
  renderClientList();
  refreshAdminStats();
  /* Visual feedback — flash the input green */
  var inp = document.getElementById('modal-name-inp');
  if (inp) {
    inp.style.borderColor = '#70c090';
    inp.style.boxShadow   = '0 0 0 3px rgba(112,192,144,0.15)';
    setTimeout(function () {
      inp.style.borderColor = '';
      inp.style.boxShadow   = '';
    }, 1500);
  }
  showToast('Name updated to ' + n + ' ✦', 'success');
}

function saveModalOverrides(phone) {
  var c       = DB.clients[phone];
  var newName = (document.getElementById('modal-name-inp').value  || '').trim();
  c.name     = newName || c.name;
  c.birthday = (document.getElementById('modal-bday-inp').value  || '').trim();
  c.notes    = (document.getElementById('modal-notes-inp').value || '').trim();
  saveDB();
  /* Update modal header live before closing */
  var titleEl = document.querySelector('#client-modal .modal-title');
  if (titleEl && newName) titleEl.textContent = newName + (c.rankLocked ? ' 🔒' : '');
  var avatarEl = document.querySelector('#client-modal .modal-avatar');
  if (avatarEl && newName) avatarEl.textContent = newName[0].toUpperCase();
  renderClientList();
  refreshAdminStats();
  closeModal();
  showToast('Client record saved ✦', 'success');
}

function grantPoints(phone) {
  var pts = parseInt(document.getElementById('modal-pts-inp').value) || 0;
  if (pts <= 0) { showToast('Enter a valid points amount', 'error'); return; }
  DB.clients[phone].loyaltyPoints = (DB.clients[phone].loyaltyPoints || 0) + pts;
  saveDB();
  showToast('+' + fmt(pts) + ' points granted to ' + (DB.clients[phone].name || phone), 'success');
  document.getElementById('modal-pts-inp').value = '';
}

function toggleRankLock(phone, locked) {
  DB.clients[phone].rankLocked = locked;
  saveDB();
  showToast(locked ? '🔒 Rank locked for VIP' : '🔓 Rank lock removed', 'success');
}


/* ══════════════════════════════════════════════════════
   19. AUTO VISIT ENGINE
══════════════════════════════════════════════════════ */
function liveClientLookup() {
  var phone  = (document.getElementById('inp-visit-phone').value || '').replace(/\D/g, '');
  var resEl  = document.getElementById('client-lookup-result');

  if (phone.length !== 10) {
    resEl.style.display = 'none';
    document.getElementById('visit-calc-preview').style.display = 'none';
    return;
  }

  var d = DB.clients[phone];
  if (!d) {
    resEl.innerHTML     = '<span style="color:var(--rose);">⚠ Not a registered client</span>';
    resEl.style.display = 'block';
    document.getElementById('visit-calc-preview').style.display = 'none';
    return;
  }

  var extra = '';
  if (d.referralDiscount) extra += ' <span style="color:var(--gold);">🎁 Referral 10% active</span>';
  if (d.rankLocked)       extra += ' <span style="color:var(--gold);">🔒 VIP</span>';

  resEl.innerHTML =
    '<span style="color:var(--gold);">✦ ' + (d.name || '(No name)') + '</span>' +
    ' · ' + rankEmoji(d.rank) + ' ' + cap(d.rank) +
    ' · ' + (d.visits || 0) + ' visits' +
    ' · Rs.' + fmt(d.lifetimeSpend || 0) + ' lifetime' + extra;
  resEl.style.display = 'block';
  calcVisitPreview();
}

function onServiceSelect() {
  var sel = document.getElementById('inp-visit-service');
  var opt = sel.options[sel.selectedIndex];
  if (opt && opt.dataset.price) {
    document.getElementById('inp-visit-spend').value = opt.dataset.price;
  }
  calcVisitPreview();
}

function calcVisitPreview() {
  var phone    = (document.getElementById('inp-visit-phone').value || '').replace(/\D/g, '');
  var spendRaw = parseFloat(document.getElementById('inp-visit-spend').value) || 0;
  var prevEl   = document.getElementById('visit-calc-preview');

  if (!phone || phone.length !== 10 || !DB.clients[phone] || spendRaw <= 0) {
    prevEl.style.display = 'none';
    return;
  }

  var c    = DB.clients[phone];
  var tier = getTier(c.rank);
  var disc = tier.discount;
  var refBonus = false;

  /* Check birthday month for Diamond */
  var birthdayBonus = false;
  if (c.rank === 'diamond' && c.birthday) {
    var bMonth = c.birthday.split('-')[1];
    var curMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    if (bMonth === curMonth) {
      disc         = disc + tier.birthdayDisc;
      birthdayBonus = true;
    }
  }

  if (c.referralDiscount && !c.referralGiven) {
    disc     = Math.max(disc, 0.10);
    refBonus = true;
  }

  var charged = Math.round(spendRaw * (1 - disc));
  var pts     = calcPoints(spendRaw, c.rank);

  prevEl.innerHTML =
    '<div class="calc-row"><span>Original Price</span><strong>Rs. ' + fmt(spendRaw) + '</strong></div>' +
    '<div class="calc-row"><span>Rank Discount (' + cap(c.rank) + ')</span><strong class="gold">' + (tier.discount * 100) + '%</strong></div>' +
    (birthdayBonus ? '<div class="calc-row"><span>🎂 Birthday Bonus (Diamond)</span><strong class="gold">+' + (tier.birthdayDisc * 100) + '%</strong></div>' : '') +
    (refBonus ? '<div class="calc-row"><span>🎁 Referral Bonus</span><strong class="gold">+extra 10%</strong></div>' : '') +
    '<div class="calc-row total"><span>Amount to Charge</span><strong>Rs. ' + fmt(charged) + '</strong></div>' +
    '<div class="calc-row"><span>Loyalty Points Earned</span><strong class="gold">+' + pts + (c.rank === 'diamond' ? ' (×1.1)' : '') + '</strong></div>';
  prevEl.style.display = 'block';
}

function renderServiceSelectOptions() {
  var sel = document.getElementById('inp-visit-service');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select a service —</option>';
  DB.services.forEach(function (cat) {
    var grp   = document.createElement('optgroup');
    grp.label = cat.name;
    cat.items.forEach(function (item) {
      var opt           = document.createElement('option');
      opt.value         = item.id;
      opt.textContent   = item.name + ' — Rs.' + fmt(item.price);
      opt.dataset.price = item.price;
      grp.appendChild(opt);
    });
    sel.appendChild(grp);
  });
}

function logVisit() {
  var phone    = (document.getElementById('inp-visit-phone').value || '').replace(/\D/g, '');
  var spendRaw = parseFloat(document.getElementById('inp-visit-spend').value) || 0;
  var selEl    = document.getElementById('inp-visit-service');
  var note     = selEl.options[selEl.selectedIndex]
    ? selEl.options[selEl.selectedIndex].text.split(' — ')[0]
    : '';
  var staffId  = (document.getElementById('inp-visit-staff')
    ? document.getElementById('inp-visit-staff').value : '');

  if (phone.length !== 10)  { showToast('Enter a valid 10-digit number', 'error'); return; }
  if (!DB.clients[phone])   { showToast('Not a registered client', 'error');        return; }
  if (spendRaw <= 0)        { showToast('Enter amount > 0', 'error');               return; }

  var c       = DB.clients[phone];
  var oldRank = c.rank;
  var tier    = getTier(oldRank);
  var disc    = tier.discount;
  var refDiscount   = false;
  var birthdayBonus = false;

  /* Birthday bonus for Diamond */
  if (c.rank === 'diamond' && c.birthday) {
    var bMonth   = c.birthday.split('-')[1];
    var curMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    if (bMonth === curMonth) {
      disc          = disc + tier.birthdayDisc;
      birthdayBonus = true;
    }
  }

  /* Referral bonus */
  if (c.referralDiscount && !c.referralGiven) {
    disc               = Math.max(disc, 0.10);
    refDiscount        = true;
    c.referralGiven    = true;
    c.referralDiscount = false;
  }

  var charged = Math.round(spendRaw * (1 - disc));
  var pts     = calcPoints(spendRaw, oldRank);
  var key     = monthKey();

  /* Update client */
  c.visits        = (c.visits || 0) + 1;
  c.lifetimeSpend = (c.lifetimeSpend || 0) + charged;
  c.loyaltyPoints = (c.loyaltyPoints || 0) + pts;
  if (!c.monthlySpend) c.monthlySpend = {};
  c.monthlySpend[key] = (c.monthlySpend[key] || 0) + charged;
  if (!c.visitLog) c.visitLog = [];
  c.visitLog.push({
    date: today(), spend: spendRaw, charged: charged,
    pts: pts, note: note,
    refDiscount: refDiscount, birthdayBonus: birthdayBonus,
    staffId: staffId
  });

  /* Update revenue */
  if (!DB.revenue) DB.revenue = {};
  DB.revenue[key] = (DB.revenue[key] || 0) + charged;

  /* Staff commission */
  if (staffId) {
    var staff = DB.staff.find(function (s) { return s.id === staffId; });
    if (staff) {
      if (!staff.earnings) staff.earnings = {};
      var commAmt = Math.round(charged * (staff.commissionPct / 100));
      staff.earnings[key] = (staff.earnings[key] || 0) + commAmt;
    }
  }

  /* Update inventory (auto-deduct qty for service) */
  /* (in a real app you'd map service → inventory items) */

  /* Sync rank and run maintenance check */
  ensureRank(c);
  runMaintenanceCheck(c);
  saveDB();

  var newRank = c.rank;
  var rankUp  = newRank !== oldRank;
  var maint   = maintenanceStatus(c);

  /* Result card */
  var resultEl = document.getElementById('visit-result-card');
  resultEl.innerHTML =
    '<div class="visit-result-inner">' +
      '<div class="vr-top">' +
        '<div class="vr-check">✓</div>' +
        '<div>' +
          '<div class="vr-name">' + (c.name || 'Client') + ' · +92 ' + phone + '</div>' +
          '<div class="vr-sub">Visit #' + c.visits + ' · ' + today() + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="vr-grid">' +
        '<div class="vr-stat"><span>Original</span><strong>Rs. ' + fmt(spendRaw) + '</strong></div>' +
        '<div class="vr-stat"><span>Discount</span><strong class="gold">' + Math.round(disc * 100) + '%' + (refDiscount ? ' 🎁' : '') + (birthdayBonus ? ' 🎂' : '') + '</strong></div>' +
        '<div class="vr-stat"><span>Charged</span><strong>Rs. ' + fmt(charged) + '</strong></div>' +
        '<div class="vr-stat"><span>Points +</span><strong class="gold">+' + pts + (oldRank === 'diamond' ? ' ×1.1' : '') + '</strong></div>' +
        '<div class="vr-stat"><span>Total Pts</span><strong>' + fmt(c.loyaltyPoints) + '</strong></div>' +
        '<div class="vr-stat"><span>Rank</span><strong>' + rankEmoji(c.rank) + ' ' + cap(c.rank) + '</strong></div>' +
      '</div>' +
      (rankUp ? '<div class="vr-rankup">🎉 Rank upgraded! ' + rankEmoji(oldRank) + ' ' + cap(oldRank) + ' → ' + rankEmoji(c.rank) + ' ' + cap(c.rank) + '</div>' : '') +
      (c.demoted ? '<div class="vr-warn">⬇️ Note: This client was demoted. Restoration in progress.</div>' : '') +
      (!maint.ok && c.rank !== 'new' && !c.demoted
        ? '<div class="vr-warn">⚠️ Monthly: Rs.' + fmt(Math.round((c.monthlySpend || {})[key] || 0)) + ' / Rs.' + fmt(maint.needed) + '</div>'
        : '') +
    '</div>';
  resultEl.style.display = 'block';

  /* Clear form */
  document.getElementById('inp-visit-phone').value = '';
  document.getElementById('inp-visit-spend').value = '';
  document.getElementById('inp-visit-service').selectedIndex = 0;
  document.getElementById('client-lookup-result').style.display  = 'none';
  document.getElementById('visit-calc-preview').style.display    = 'none';

  renderClientList();
  refreshAdminStats();
  renderAlerts();
  renderRevenuePanel();

  showToast('Visit logged for ' + (c.name || phone) + ' ✦', 'success');
  if (rankUp) setTimeout(function () {
    showToast('🎉 ' + (c.name || 'Client') + ' upgraded to ' + cap(c.rank) + '!', 'success');
  }, 1500);
}


/* ══════════════════════════════════════════════════════
   20. LOYALTY REDEEMER
══════════════════════════════════════════════════════ */
function liveRedeemerLookup() {
  var phone = (document.getElementById('inp-redeem-phone').value || '').replace(/\D/g, '');
  var resEl = document.getElementById('redeem-client-result');

  if (phone.length !== 10) { resEl.style.display = 'none'; return; }
  var d = DB.clients[phone];
  if (!d) {
    resEl.innerHTML     = '<span style="color:var(--rose);">⚠ Not a registered client</span>';
    resEl.style.display = 'block';
    return;
  }
  resEl.innerHTML =
    '<span style="color:var(--gold);">✦ ' + (d.name || '(No name)') + '</span>' +
    ' · ' + rankEmoji(d.rank) + ' ' + cap(d.rank) +
    ' · <strong style="color:var(--gold);">' + fmt(d.loyaltyPoints || 0) + ' points</strong>';
  resEl.style.display = 'block';
}

function redeemLoyalty() {
  var phone  = (document.getElementById('inp-redeem-phone').value || '').replace(/\D/g, '');
  var itemId = document.getElementById('inp-redeem-item').value;

  if (phone.length !== 10) { showToast('Enter a valid 10-digit number', 'error'); return; }
  if (!DB.clients[phone])  { showToast('Not a registered client', 'error');        return; }
  if (!itemId)             { showToast('Select a reward', 'error');                 return; }

  var c    = DB.clients[phone];
  var item = DB.loyaltyShop.find(function (i) { return i.id === itemId; });
  if (!item) { showToast('Reward not found', 'error'); return; }

  if ((c.loyaltyPoints || 0) < item.points) {
    showToast(
      (c.name || 'Client') + ' has ' + fmt(c.loyaltyPoints || 0) +
      ' pts. Needs ' + fmt(item.points) + ' for "' + item.name + '"',
      'error'
    );
    return;
  }

  c.loyaltyPoints -= item.points;
  if (!c.redemptionLog) c.redemptionLog = [];
  c.redemptionLog.push({ date: today(), item: item.name, points: item.points });
  saveDB();

  var resultEl = document.getElementById('redeem-result-card');
  resultEl.innerHTML =
    '<div class="visit-result-inner">' +
      '<div class="vr-top">' +
        '<div class="vr-check">🎁</div>' +
        '<div>' +
          '<div class="vr-name">' + (c.name || 'Client') + ' · +92 ' + phone + '</div>' +
          '<div class="vr-sub">Redeemed · ' + today() + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="vr-grid">' +
        '<div class="vr-stat"><span>Reward</span><strong>' + item.name + '</strong></div>' +
        '<div class="vr-stat"><span>Points Used</span><strong style="color:var(--rose);">−' + fmt(item.points) + '</strong></div>' +
        '<div class="vr-stat"><span>Remaining</span><strong class="gold">' + fmt(c.loyaltyPoints) + '</strong></div>' +
      '</div>' +
    '</div>';
  resultEl.style.display = 'block';

  document.getElementById('inp-redeem-phone').value = '';
  document.getElementById('inp-redeem-item').value  = '';
  document.getElementById('redeem-client-result').style.display = 'none';
  renderClientList();
  showToast('🎁 "' + item.name + '" redeemed for ' + (c.name || phone) + '!', 'success');
}

function renderRedeemDropdown() {
  var sel = document.getElementById('inp-redeem-item');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select reward —</option>';
  (DB.loyaltyShop || []).forEach(function (item) {
    var opt       = document.createElement('option');
    opt.value     = item.id;
    opt.textContent = item.name + ' (' + fmt(item.points) + ' pts)';
    sel.appendChild(opt);
  });
}


/* ══════════════════════════════════════════════════════
   21. REVENUE PANEL
══════════════════════════════════════════════════════ */
function renderRevenuePanel() {
  var el  = document.getElementById('revenue-panel');
  if (!el) return;

  var rev      = DB.revenue || {};
  var keys     = Object.keys(rev).sort().reverse();
  var thisMonth = rev[monthKey()] || 0;
  var allTime   = Object.values(rev).reduce(function (s, v) { return s + v; }, 0);

  var rows = keys.slice(0, 6).map(function (k) {
    var parts = k.split('-');
    var label = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' });
    var isCurrent = k === monthKey();
    return '<div class="rev-row' + (isCurrent ? ' rev-current' : '') + '">' +
      '<span class="rev-month">' + label + (isCurrent ? ' <span class="risk-tag" style="color:var(--gold);border-color:rgba(201,168,76,.3);">current</span>' : '') + '</span>' +
      '<span class="rev-amount">Rs. ' + fmt(Math.round(rev[k])) + '</span>' +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div class="rev-summary">' +
      '<div class="rev-stat"><span class="rev-big">Rs. ' + fmt(Math.round(thisMonth)) + '</span><span class="rev-lbl">This Month</span></div>' +
      '<div class="rev-stat"><span class="rev-big">Rs. ' + fmt(Math.round(allTime))   + '</span><span class="rev-lbl">All-Time Revenue</span></div>' +
    '</div>' +
    (rows ? '<div class="rev-list">' + rows + '</div>' : '<div class="empty-state">No revenue yet</div>');
}


/* ══════════════════════════════════════════════════════
   22. INVENTORY PANEL
══════════════════════════════════════════════════════ */
function renderInventoryPanel() {
  var el = document.getElementById('inventory-panel');
  if (!el) return;

  el.innerHTML = (DB.inventory || []).map(function (item, i) {
    var isLow  = item.qty <= item.lowAt;
    return '<div class="inv-row' + (isLow ? ' inv-low' : '') + '">' +
      '<div class="inv-info">' +
        '<div class="inv-name">' + item.name + (isLow ? ' <span class="risk-tag">LOW</span>' : '') + '</div>' +
        '<div class="inv-unit">' + item.qty + ' ' + item.unit + ' remaining</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:.5rem;">' +
        '<input type="number" class="field-input inv-qty-inp" style="width:70px;padding:.4rem .6rem;font-size:.82rem;" value="' + item.qty + '" min="0" data-idx="' + i + '" onchange="updateInventoryQty(' + i + ',this.value)"/>' +
        '<button class="rm-btn" onclick="removeInventoryItem(' + i + ')">✕</button>' +
      '</div>' +
    '</div>';
  }).join('') || '<div class="empty-state">No inventory items</div>';
}

function updateInventoryQty(idx, val) {
  DB.inventory[idx].qty = parseInt(val) || 0;
  saveDB();
  renderInventoryPanel();
}

function removeInventoryItem(idx) {
  DB.inventory.splice(idx, 1);
  saveDB();
  renderInventoryPanel();
}

function addInventoryItem() {
  var name  = (document.getElementById('inp-inv-name').value  || '').trim();
  var qty   = parseInt(document.getElementById('inp-inv-qty').value)   || 0;
  var lowAt = parseInt(document.getElementById('inp-inv-low').value)   || 1;
  var unit  = (document.getElementById('inp-inv-unit').value  || '').trim() || 'units';
  if (!name) { showToast('Enter item name', 'error'); return; }
  DB.inventory.push({ id: 'i' + Date.now(), name: name, qty: qty, lowAt: lowAt, unit: unit });
  saveDB();
  document.getElementById('inp-inv-name').value = '';
  document.getElementById('inp-inv-qty').value  = '';
  document.getElementById('inp-inv-low').value  = '';
  document.getElementById('inp-inv-unit').value = '';
  renderInventoryPanel();
  showToast('"' + name + '" added to inventory', 'success');
}


/* ══════════════════════════════════════════════════════
   23. STAFF PORTAL
══════════════════════════════════════════════════════ */
function renderStaffPanel() {
  var el = document.getElementById('staff-panel');
  if (!el) return;

  el.innerHTML = (DB.staff || []).map(function (s, i) {
    var key          = monthKey();
    var monthEarning = s.earnings ? (s.earnings[key] || 0) : 0;
    var totalEarning = s.earnings
      ? Object.values(s.earnings).reduce(function (sum, v) { return sum + v; }, 0)
      : 0;

    return '<div class="staff-card">' +
      '<div class="staff-info">' +
        '<div class="staff-name">' + s.name + '</div>' +
        '<div class="staff-role">' + s.role + ' · ' + s.commissionPct + '% commission</div>' +
      '</div>' +
      '<div class="staff-earnings">' +
        '<div class="se-row"><span>This month</span><strong class="gold">Rs. ' + fmt(Math.round(monthEarning)) + '</strong></div>' +
        '<div class="se-row"><span>All-time</span><strong>Rs. ' + fmt(Math.round(totalEarning)) + '</strong></div>' +
      '</div>' +
      '<button class="rm-btn" style="align-self:center;" onclick="removeStaff(' + i + ')">✕</button>' +
    '</div>';
  }).join('') || '<div class="empty-state">No staff added</div>';
}

function removeStaff(i) {
  if (!confirm('Remove staff member ' + DB.staff[i].name + '?')) return;
  DB.staff.splice(i, 1);
  saveDB();
  renderStaffPanel();
  renderServiceSelectOptions(); /* refresh staff dropdown in visit */
  showToast('Staff removed', '');
}

function addStaffMember() {
  var name = (document.getElementById('inp-staff-name').value || '').trim();
  var role = (document.getElementById('inp-staff-role').value || '').trim();
  var pct  = parseInt(document.getElementById('inp-staff-pct').value) || 10;
  if (!name || !role) { showToast('Enter name and role', 'error'); return; }
  DB.staff.push({ id: 's' + Date.now(), name: name, role: role, commissionPct: pct, schedule: [], earnings: {} });
  saveDB();
  document.getElementById('inp-staff-name').value = '';
  document.getElementById('inp-staff-role').value = '';
  document.getElementById('inp-staff-pct').value  = '';
  renderStaffPanel();
  renderStaffSelectOptions();
  showToast(name + ' added to staff', 'success');
}

function renderStaffSelectOptions() {
  var sel = document.getElementById('inp-visit-staff');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Assign Staff (optional) —</option>';
  (DB.staff || []).forEach(function (s) {
    var opt       = document.createElement('option');
    opt.value     = s.id;
    opt.textContent = s.name + ' · ' + s.role;
    sel.appendChild(opt);
  });
}


/* ══════════════════════════════════════════════════════
   24. LOYALTY SHOP MANAGEMENT
══════════════════════════════════════════════════════ */
function renderShopAdmin() {
  var el  = document.getElementById('shop-admin-list');
  var cnt = document.getElementById('shop-count');
  if (!el) return;
  cnt.textContent = (DB.loyaltyShop || []).length;
  el.innerHTML = (DB.loyaltyShop || []).length
    ? DB.loyaltyShop.map(function (item, i) {
        return '<div class="admin-item">' +
          '<div>' +
            '<div class="a-name">' + item.name + ' — ' + fmt(item.points) + ' pts</div>' +
            '<div class="a-phone">' + (item.desc || '') + '</div>' +
          '</div>' +
          '<button class="rm-btn" onclick="removeShopItem(' + i + ')">✕</button>' +
        '</div>';
      }).join('')
    : '<div style="color:var(--muted);font-size:.82rem;">No items</div>';
}

function addShopItem() {
  var name = (document.getElementById('inp-shop-name').value || '').trim();
  var pts  = parseInt(document.getElementById('inp-shop-pts').value) || 0;
  var desc = (document.getElementById('inp-shop-desc').value || '').trim();
  if (!name || pts <= 0) { showToast('Enter name and points', 'error'); return; }
  if (!DB.loyaltyShop) DB.loyaltyShop = [];
  DB.loyaltyShop.push({ id: 'l' + Date.now(), name: name, points: pts, desc: desc });
  saveDB();
  document.getElementById('inp-shop-name').value = '';
  document.getElementById('inp-shop-pts').value  = '';
  document.getElementById('inp-shop-desc').value = '';
  renderShopAdmin();
  renderLoyaltyShop();
  renderRedeemDropdown();
  showToast('"' + name + '" added', 'success');
}

function removeShopItem(i) {
  DB.loyaltyShop.splice(i, 1);
  saveDB();
  renderShopAdmin();
  renderLoyaltyShop();
  renderRedeemDropdown();
}

function savePointsRate() {
  var v = parseInt(document.getElementById('inp-pts-rate').value) || 1;
  DB.config.pointsPerHundred = v;
  saveDB();
  showToast('Points rate: ' + v + ' pt per Rs.100 ✦', 'success');
  renderLoyaltyShop();
}


/* ══════════════════════════════════════════════════════
   25. EXPLORE PAGE — RENDER SECTIONS
══════════════════════════════════════════════════════ */
function renderExploreServices() {
  var tabsEl   = document.getElementById('services-tabs-row');
  var panelsEl = document.getElementById('services-panels');
  if (!tabsEl || !panelsEl) return;

  tabsEl.innerHTML = DB.services.map(function (cat, i) {
    return '<button class="srv-tab ' + (i === 0 ? 'active' : '') +
      '" onclick="switchSrvTab(this,\'srv-' + cat.id + '\')">' + cat.name + '</button>';
  }).join('');

  panelsEl.innerHTML = DB.services.map(function (cat, i) {
    var items = cat.items.map(function (it) {
      return '<div class="srv-item">' +
        '<div class="srv-name"><span class="srv-dot"></span>' + it.name + '</div>' +
        '<div class="srv-price">Rs. ' + fmt(it.price) + '+</div>' +
      '</div>';
    }).join('');
    return '<div class="services-list ' + (i !== 0 ? 'hidden' : '') + '" id="srv-' + cat.id + '">' +
      (items || '<div class="empty-state">No services</div>') +
    '</div>';
  }).join('');
}

function renderLoyaltyShop() {
  var el = document.getElementById('loyalty-grid');
  if (!el) return;
  var noteEl = document.getElementById('loyalty-rate-note');
  var rate   = DB.config.pointsPerHundred || 1;
  if (noteEl) {
    noteEl.textContent = 'Earn ' + rate + ' point' + (rate > 1 ? 's' : '') + ' for every Rs.100 spent.';
  }
  if (!DB.loyaltyShop || !DB.loyaltyShop.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:2rem 0;">No rewards available yet</div>';
    return;
  }
  el.innerHTML = DB.loyaltyShop.map(function (item) {
    return '<div class="loyalty-card">' +
      '<div class="lc-pts">' + fmt(item.points) + '</div>' +
      '<div class="lc-pts-lbl">points</div>' +
      '<div class="lc-name">' + item.name + '</div>' +
      '<div class="lc-desc">' + (item.desc || '') + '</div>' +
    '</div>';
  }).join('');
}

/* ── Vibe-Based Search ── */
function renderVibeSearch() {
  var el = document.getElementById('vibe-grid');
  if (!el) return;
  var vibes = DB.config.vibes || [];
  el.innerHTML = vibes.map(function (v) {
    return '<button class="vibe-btn" style="--vibe-color:' + v.color + ';" onclick="selectVibe(\'' + v.label + '\')">' +
      '<span class="vibe-emoji">' + v.emoji + '</span>' +
      '<span class="vibe-label">' + v.label + '</span>' +
    '</button>';
  }).join('');
}

function selectVibe(label) {
  var el = document.getElementById('vibe-result');
  if (!el) return;

  /* Find matching services from all categories */
  var matches = [];
  DB.services.forEach(function (cat) {
    cat.items.forEach(function (item) {
      matches.push(item.name + ' · Rs.' + fmt(item.price));
    });
  });

  /* Show top 3 random services as "recommendations" */
  matches = matches.sort(function () { return 0.5 - Math.random(); }).slice(0, 3);

  el.innerHTML =
    '<p style="color:var(--gold);font-size:.85rem;margin-bottom:.8rem;">✦ For <strong>' + label + '</strong>, we recommend:</p>' +
    matches.map(function (m) {
      return '<div class="vibe-service-row">' +
        '<span class="srv-dot"></span>' + m +
      '</div>';
    }).join('');
  el.style.display = 'block';
}

/* ── Lookbook Grid ── */
/* ── Lookbook: public render (explore page) ── */
function renderLookbook() {
  var el = document.getElementById('lookbook-grid');
  if (!el) return;
  var items = DB.config.lookbook || [];

  if (!items.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:2rem;">No lookbook items added yet</div>';
    return;
  }

  el.innerHTML = items.map(function (item, i) {
    /* Show uploaded image if available, otherwise fallback to emoji */
    var visual = item.image
      ? '<img src="' + item.image + '" alt="' + item.title + '" class="lb-img"/>'
      : '<div class="lb-visual">' + (item.emoji || '✨') + '</div>';

    return '<div class="lookbook-item" data-delay="' + (i * 80) + '">' +
      visual +
      '<div class="lb-info">' +
        '<div class="lb-title">' + (item.title || 'Look ' + (i + 1)) + '</div>' +
        '<div class="lb-service">' + (item.service || '') + '</div>' +
        '<div class="lb-price">' + (item.price ? 'Rs. ' + fmt(item.price) : '') + '</div>' +
      '</div>' +
      '<div class="lb-overlay">' +
        '<button class="lb-cta-btn" onclick="scrollToServices()">Get This Look →</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── Lookbook: admin CRUD panel ── */
function renderLookbookAdmin() {
  var el = document.getElementById('lookbook-admin-list');
  if (!el) return;

  var items = DB.config.lookbook || [];

  if (!items.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:.5rem 0;">No lookbook cards yet</div>';
    return;
  }

  el.innerHTML = items.map(function (item, i) {
    var thumb = item.image
      ? '<img src="' + item.image + '" class="lb-admin-thumb" alt=""/>'
      : '<div class="lb-admin-thumb-emoji">' + (item.emoji || '✨') + '</div>';

    return '<div class="lb-admin-row">' +
      '<div class="lb-admin-preview">' + thumb + '</div>' +
      '<div class="lb-admin-fields">' +
        '<input type="text"   class="field-input lb-inp-small" placeholder="Title"   value="' + (item.title   || '') + '" onchange="updateLbField(' + i + ',\'title\',this.value)"/>' +
        '<input type="text"   class="field-input lb-inp-small" placeholder="Service" value="' + (item.service || '') + '" onchange="updateLbField(' + i + ',\'service\',this.value)"/>' +
        '<input type="number" class="field-input lb-inp-small" placeholder="Price"   value="' + (item.price   || '') + '" onchange="updateLbField(' + i + ',\'price\',this.value)"/>' +
        '<input type="text"   class="field-input lb-inp-small" placeholder="Emoji fallback" value="' + (item.emoji || '') + '" onchange="updateLbField(' + i + ',\'emoji\',this.value)"/>' +
      '</div>' +
      '<div class="lb-admin-actions">' +
        '<label class="lb-upload-label" title="Upload photo">' +
          '📷' +
          '<input type="file" accept="image/*" style="display:none;" onchange="uploadLbImage(' + i + ',this)"/>' +
        '</label>' +
        (item.image ? '<button class="lb-rm-img" onclick="removeLbImage(' + i + ')" title="Remove photo">🗑</button>' : '') +
        '<button class="rm-btn" onclick="removeLbItem(' + i + ')">✕</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* Upload image for a lookbook card — converts to base64 and stores in DB */
function uploadLbImage(idx, input) {
  var file = input.files[0];
  if (!file) return;

  /* Cap image size to keep localStorage lean — resize to max 600px */
  var reader = new FileReader();
  reader.onload = function (e) {
    var img    = new Image();
    img.onload = function () {
      var canvas  = document.createElement('canvas');
      var maxSize = 600;
      var ratio   = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      DB.config.lookbook[idx].image = dataUrl;
      saveDB();
      renderLookbookAdmin();
      renderLookbook();
      showToast('Photo uploaded! ✦', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeLbImage(idx) {
  delete DB.config.lookbook[idx].image;
  saveDB();
  renderLookbookAdmin();
  renderLookbook();
  showToast('Photo removed', '');
}

function updateLbField(idx, field, val) {
  if (!DB.config.lookbook[idx]) return;
  DB.config.lookbook[idx][field] = field === 'price' ? (parseFloat(val) || 0) : val;
  saveDB();
  renderLookbook(); /* live update on explore page */
}

function removeLbItem(idx) {
  if (!confirm('Remove this lookbook card?')) return;
  DB.config.lookbook.splice(idx, 1);
  saveDB();
  renderLookbookAdmin();
  renderLookbook();
  showToast('Card removed', '');
}

function addLbItem() {
  if (!DB.config.lookbook) DB.config.lookbook = [];
  DB.config.lookbook.push({
    id:      'lb' + Date.now(),
    title:   '',
    service: '',
    price:   0,
    emoji:   '✨',
    image:   null
  });
  saveDB();
  renderLookbookAdmin();
  showToast('New card added — fill in the details below', 'success');
}

function scrollToServices() {
  var el = document.getElementById('services-block');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}


/* ══════════════════════════════════════════════════════
   26. CUSTOMISATION
══════════════════════════════════════════════════════ */
function loadCustomFields() {
  var cfg = DB.config;
  var map = {
    'cust-brand':          'brand',
    'cust-tagline':        'tagline',
    'cust-hero-title':     'heroTitle',
    'cust-hero-sub':       'heroSub',
    'cust-est':            'estYear',
    'cust-stat-clients':   'statClients',
    'cust-stat-exp':       'statExp',
    'cust-stat-services':  'statServices',
    'cust-address':        'address',
    'cust-contact':        'contact',
    'cust-hours':          'hours',
    'cust-cta':            'ctaText',
    'cust-about':          'aboutText'
  };
  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = cfg[map[id]] || '';
  });
  var rateEl = document.getElementById('inp-pts-rate');
  if (rateEl) rateEl.value = cfg.pointsPerHundred || 1;
}

function saveCustomization() {
  function g(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  DB.config.brand        = g('cust-brand')         || DB.config.brand;
  DB.config.tagline      = g('cust-tagline')        || DB.config.tagline;
  DB.config.heroTitle    = g('cust-hero-title')     || DB.config.heroTitle;
  DB.config.heroSub      = g('cust-hero-sub')       || DB.config.heroSub;
  DB.config.estYear      = g('cust-est')            || DB.config.estYear;
  DB.config.statClients  = g('cust-stat-clients')   || DB.config.statClients;
  DB.config.statExp      = g('cust-stat-exp')       || DB.config.statExp;
  DB.config.statServices = g('cust-stat-services')  || DB.config.statServices;
  DB.config.address      = g('cust-address')        || DB.config.address;
  DB.config.contact      = g('cust-contact')        || DB.config.contact;
  DB.config.hours        = g('cust-hours')          || DB.config.hours;
  DB.config.ctaText      = g('cust-cta')            || DB.config.ctaText;
  DB.config.aboutText    = g('cust-about')          || DB.config.aboutText;
  saveDB();
  applyCustomization();
  showToast('Website updated! ✦', 'success');
}

function applyCustomization() {
  var cfg = DB.config;
  function setText(id, val) { var el = document.getElementById(id); if (el && val) el.textContent = val; }
  function setHTML(id, val) { var el = document.getElementById(id); if (el && val) el.innerHTML   = val; }

  setText('site-brand-name',      cfg.brand);
  setText('explore-header-brand', cfg.brand);
  setText('footer-brand',         cfg.brand);
  setText('site-brand-tagline',   cfg.tagline);
  setHTML('hero-title',           cfg.heroTitle);
  setText('hero-sub',             cfg.heroSub);
  setText('hero-label',    'BEAUTY PARLOUR · EST. ' + cfg.estYear);
  setText('stat-clients',  cfg.statClients);
  setText('stat-exp',      cfg.statExp);
  setText('stat-services', cfg.statServices);
  setText('cta-address',   '📍 ' + cfg.address);
  setText('cta-phone',     '📞 ' + cfg.contact);
  setText('cta-hours',     '🕐 ' + cfg.hours);
  setText('cta-text',      cfg.ctaText);

  var aboutEl = document.getElementById('about-text');
  if (aboutEl && cfg.aboutText) {
    aboutEl.innerHTML = cfg.aboutText.split('\n\n').map(function (p, i) {
      return '<p' + (i > 0 ? ' style="margin-top:1rem;"' : '') + '>' + p + '</p>';
    }).join('');
  }
}


/* ══════════════════════════════════════════════════════
   27. SERVICES MANAGEMENT
══════════════════════════════════════════════════════ */
function renderServicesAdmin() {
  var el = document.getElementById('services-admin-panel');
  if (!el) return;

  el.innerHTML = DB.services.map(function (cat, ci) {
    var itemRows = cat.items.map(function (item, ii) {
      return '<div class="admin-item" style="padding:.5rem .8rem;">' +
        '<div style="flex:1;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;">' +
          '<input type="text" class="field-input" style="flex:1;min-width:130px;padding:.45rem .7rem;font-size:.82rem;" value="' + item.name + '" onchange="updateSvcName(' + ci + ',' + ii + ',this.value)"/>' +
          '<div style="display:flex;align-items:center;gap:.3rem;">' +
            '<span style="color:var(--muted);font-size:.8rem;">Rs.</span>' +
            '<input type="number" class="field-input" style="width:90px;padding:.45rem .7rem;font-size:.82rem;" value="' + item.price + '" onchange="updateSvcPrice(' + ci + ',' + ii + ',this.value)"/>' +
          '</div>' +
        '</div>' +
        '<button class="rm-btn" onclick="removeSvcItem(' + ci + ',' + ii + ')">✕</button>' +
      '</div>';
    }).join('');

    return '<div class="svc-admin-cat">' +
      '<div class="svc-cat-header">' +
        '<strong>' + cat.name + '</strong>' +
        '<button class="rm-btn" onclick="removeCategory(' + ci + ')">✕ Remove</button>' +
      '</div>' +
      '<div class="admin-list" style="margin:0;">' + itemRows + '</div>' +
      '<button class="btn-ghost-sm" style="margin-top:.5rem;" onclick="addSvcItem(' + ci + ')">+ Add Service</button>' +
    '</div>';
  }).join('');
}

function addCategory() {
  var name = (document.getElementById('inp-cat-name').value || '').trim();
  if (!name) { showToast('Enter category name', 'error'); return; }
  DB.services.push({ id: 'cat' + Date.now(), name: name, items: [] });
  saveDB();
  document.getElementById('inp-cat-name').value = '';
  renderServicesAdmin(); renderExploreServices(); renderServiceSelectOptions();
  showToast('"' + name + '" added', 'success');
}

function removeCategory(ci) {
  if (!confirm('Remove "' + DB.services[ci].name + '"?')) return;
  DB.services.splice(ci, 1);
  saveDB();
  renderServicesAdmin(); renderExploreServices(); renderServiceSelectOptions();
}

function addSvcItem(ci) {
  DB.services[ci].items.push({ id: 's' + Date.now(), name: 'New Service', price: 500 });
  saveDB();
  renderServicesAdmin(); renderExploreServices(); renderServiceSelectOptions();
}

function removeSvcItem(ci, ii) {
  DB.services[ci].items.splice(ii, 1);
  saveDB();
  renderServicesAdmin(); renderExploreServices(); renderServiceSelectOptions();
}

function updateSvcName(ci, ii, val)  { DB.services[ci].items[ii].name  = val;                    saveDB(); renderServiceSelectOptions(); }
function updateSvcPrice(ci, ii, val) { DB.services[ci].items[ii].price = parseFloat(val) || 0;   saveDB(); renderServiceSelectOptions(); }


/* ══════════════════════════════════════════════════════
   28. WHATSAPP ALERT
   — Day-25 grace-period message is auto-personalised
══════════════════════════════════════════════════════ */
function sendWhatsAppAlert(phone, name, rank, spent, needed) {
  var remaining = Math.max(0, needed - spent);
  var msg = encodeURIComponent(
    'Hi ' + name + '! 🌸\n\n' +
    'This is a luxury reminder from *Abeenaz Parlour*. ✨\n\n' +
    'Your current status: *' + rankEmoji(rank) + ' ' + cap(rank) + '*\n' +
    'You\'re only *Rs. ' + fmt(remaining) + '* away from keeping your ' + cap(rank) + ' perks!\n\n' +
    'Book a refresh to stay sparkling — we\'d love to see you soon. 💛\n\n' +
    '📍 ' + DB.config.address + '\n' +
    '📞 ' + DB.config.contact + '\n' +
    '🕐 ' + DB.config.hours
  );
  window.open('https://wa.me/92' + phone + '?text=' + msg, '_blank');
  showToast('WhatsApp opened for +92' + phone, 'success');
}


/* ══════════════════════════════════════════════════════
   29. TAB SWITCHERS
══════════════════════════════════════════════════════ */
function switchATab(btn, tabId) {
  document.querySelectorAll('.a-tab').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.a-tab-content').forEach(function (t) { t.classList.remove('active'); });
  document.getElementById('tab-' + tabId).classList.add('active');

  if (tabId === 'alerts')    renderAlerts();
  if (tabId === 'revenue')   renderRevenuePanel();
  if (tabId === 'redeem')    renderRedeemDropdown();
  if (tabId === 'staff')     renderStaffPanel();
  if (tabId === 'inventory') renderInventoryPanel();
  if (tabId === 'customize') renderLookbookAdmin();
}

function switchSrvTab(btn, panelId) {
  document.querySelectorAll('.srv-tab').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.services-list').forEach(function (l) { l.classList.add('hidden'); });
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.remove('hidden');
}


/* ══════════════════════════════════════════════════════
   30. LOGOUT
══════════════════════════════════════════════════════ */
function logout() {
  currentPhone = ''; currentRole  = '';
  pinBuffer    = ''; newPinBuffer = '';
  strangerName = '';
  document.getElementById('inp-phone').value = '';
  closeModal();
  goScreen('s-welcome');
  showToast('See you soon! 🌸');
}


/* ══════════════════════════════════════════════════════
   31. PIN DOT HELPERS
══════════════════════════════════════════════════════ */
function updatePinDots(buf, prefix) {
  for (var i = 0; i < 4; i++) {
    var dot = document.getElementById(prefix + i);
    dot.classList.toggle('filled', i < buf.length);
    dot.classList.remove('error');
  }
}

function shakePinRow(prefix) {
  var row = document.getElementById(prefix === 'pd' ? 'pin-row' : 'newpin-row');
  for (var i = 0; i < 4; i++) {
    var dot = document.getElementById(prefix + i);
    dot.classList.add('filled', 'error');
  }
  row.classList.add('shake');
  setTimeout(function () {
    row.classList.remove('shake');
    for (var i = 0; i < 4; i++) {
      document.getElementById(prefix + i).classList.remove('filled', 'error');
    }
  }, 500);
}


/* ══════════════════════════════════════════════════════
   32. UTILITIES
══════════════════════════════════════════════════════ */
function rankEmoji(r) {
  return { diamond: '💎', gold: '⭐', silver: '🥈', bronze: '🥉', new: '🆕' }[r] || '•';
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function fmt(n) {
  return Number(n).toLocaleString('en-PK');
}


/* ══════════════════════════════════════════════════════
   33. KEY BINDINGS
══════════════════════════════════════════════════════ */
document.getElementById('inp-phone').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') handlePhone();
});

document.getElementById('inp-stranger-name').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') saveStrangerName();
});

var refInput = document.getElementById('inp-add-referrer');
if (refInput) {
  refInput.addEventListener('input', function () {
    var phone = this.value.replace(/\D/g, '');
    var el    = document.getElementById('referrer-lookup');
    if (phone.length === 10) {
      var d     = DB.clients[phone];
      el.innerHTML = d
        ? '<span style="color:var(--gold);">✦ ' + (d.name || '(No name)') + ' · ' + rankEmoji(d.rank) + ' ' + cap(d.rank) + '</span>'
        : '<span style="color:var(--rose);">⚠ Not a registered client</span>';
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
}


/* ══════════════════════════════════════════════════════
   34. INITIALISE
══════════════════════════════════════════════════════ */
document.querySelectorAll('.screen').forEach(function (s) {
  s.style.display = 'none';
});
document.getElementById('s-welcome').style.display = 'flex';
document.getElementById('s-welcome').classList.add('active');
applyCustomization();
