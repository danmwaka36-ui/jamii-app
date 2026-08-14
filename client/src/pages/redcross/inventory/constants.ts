export const INVENTORY_CATEGORIES = [
  "Food",
  "Water",
  "Shelter",
  "Blankets & Bedding",
  "Hygiene",
  "Clothing",
  "First Aid & Medical",
  "Kitchen & Cooking",
  "Rescue & Disaster Response",
  "WASH",
  "Child & Family Support",
  "Communication",
  "Lighting & Power",
  "Tools & Equipment",
  "Other Relief Items",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export interface SupplyOption {
  id: string;
  name: string;
  category: InventoryCategory;
  defaultUnit: string;
  perishable?: boolean;
  expiryRequired?: boolean;
}

export const SUPPLY_OPTIONS: SupplyOption[] = [
  // FOOD
  {
    id: "FOOD-001",
    name: "Maize Flour",
    category: "Food",
    defaultUnit: "bags",
    perishable: false,
  },
  {
    id: "FOOD-002",
    name: "Rice",
    category: "Food",
    defaultUnit: "bags",
    perishable: false,
  },
  {
    id: "FOOD-003",
    name: "Beans",
    category: "Food",
    defaultUnit: "bags",
    perishable: false,
  },
  {
    id: "FOOD-004",
    name: "Cooking Oil",
    category: "Food",
    defaultUnit: "litres",
    perishable: false,
  },
  {
    id: "FOOD-005",
    name: "Canned Food",
    category: "Food",
    defaultUnit: "cartons",
    perishable: false,
  },
  {
    id: "FOOD-006",
    name: "Ready-to-Eat Meals",
    category: "Food",
    defaultUnit: "cartons",
    perishable: false,
  },

  // WATER
  {
    id: "WAT-001",
    name: "Bottled Drinking Water",
    category: "Water",
    defaultUnit: "cartons",
  },
  {
    id: "WAT-002",
    name: "Water Containers",
    category: "Water",
    defaultUnit: "pieces",
  },
  {
    id: "WAT-003",
    name: "Jerrycans",
    category: "Water",
    defaultUnit: "pieces",
  },
  {
    id: "WAT-004",
    name: "Water Purification Tablets",
    category: "Water",
    defaultUnit: "packs",
    expiryRequired: true,
  },

  // SHELTER
  {
    id: "SHL-001",
    name: "Family Tent",
    category: "Shelter",
    defaultUnit: "pieces",
  },
  {
    id: "SHL-002",
    name: "Large Relief Tent",
    category: "Shelter",
    defaultUnit: "pieces",
  },
  {
    id: "SHL-003",
    name: "Tarpaulin",
    category: "Shelter",
    defaultUnit: "pieces",
  },
  {
    id: "SHL-004",
    name: "Rope",
    category: "Shelter",
    defaultUnit: "rolls",
  },

  // BLANKETS
  {
    id: "BED-001",
    name: "Blanket",
    category: "Blankets & Bedding",
    defaultUnit: "pieces",
  },
  {
    id: "BED-002",
    name: "Sleeping Mat",
    category: "Blankets & Bedding",
    defaultUnit: "pieces",
  },
  {
    id: "BED-003",
    name: "Bed Sheet",
    category: "Blankets & Bedding",
    defaultUnit: "pieces",
  },

  // HYGIENE
  {
    id: "HYG-001",
    name: "Family Hygiene Kit",
    category: "Hygiene",
    defaultUnit: "kits",
  },
  {
    id: "HYG-002",
    name: "Soap",
    category: "Hygiene",
    defaultUnit: "cartons",
  },
  {
    id: "HYG-003",
    name: "Sanitary Products",
    category: "Hygiene",
    defaultUnit: "packs",
  },
  {
    id: "HYG-004",
    name: "Toothbrushes",
    category: "Hygiene",
    defaultUnit: "pieces",
  },
  {
    id: "HYG-005",
    name: "Toothpaste",
    category: "Hygiene",
    defaultUnit: "pieces",
  },

  // CLOTHING
  {
    id: "CLO-001",
    name: "Adult Clothing",
    category: "Clothing",
    defaultUnit: "bundles",
  },
  {
    id: "CLO-002",
    name: "Children's Clothing",
    category: "Clothing",
    defaultUnit: "bundles",
  },
  {
    id: "CLO-003",
    name: "Shoes",
    category: "Clothing",
    defaultUnit: "pairs",
  },

  // MEDICAL
  {
    id: "MED-001",
    name: "First Aid Kit",
    category: "First Aid & Medical",
    defaultUnit: "kits",
  },
  {
    id: "MED-002",
    name: "Bandages",
    category: "First Aid & Medical",
    defaultUnit: "packs",
  },
  {
    id: "MED-003",
    name: "Disposable Gloves",
    category: "First Aid & Medical",
    defaultUnit: "boxes",
    expiryRequired: true,
  },
  {
    id: "MED-004",
    name: "Face Masks",
    category: "First Aid & Medical",
    defaultUnit: "boxes",
  },
  {
    id: "MED-005",
    name: "Antiseptic",
    category: "First Aid & Medical",
    defaultUnit: "bottles",
    expiryRequired: true,
  },

  // KITCHEN
  {
    id: "KIT-001",
    name: "Cooking Set",
    category: "Kitchen & Cooking",
    defaultUnit: "sets",
  },
  {
    id: "KIT-002",
    name: "Cooking Pots",
    category: "Kitchen & Cooking",
    defaultUnit: "sets",
  },
  {
    id: "KIT-003",
    name: "Plates",
    category: "Kitchen & Cooking",
    defaultUnit: "sets",
  },
  {
    id: "KIT-004",
    name: "Cups",
    category: "Kitchen & Cooking",
    defaultUnit: "sets",
  },

  // RESCUE
  {
    id: "RES-001",
    name: "Rescue Rope",
    category: "Rescue & Disaster Response",
    defaultUnit: "rolls",
  },
  {
    id: "RES-002",
    name: "Life Jacket",
    category: "Rescue & Disaster Response",
    defaultUnit: "pieces",
  },
  {
    id: "RES-003",
    name: "Rescue Helmet",
    category: "Rescue & Disaster Response",
    defaultUnit: "pieces",
  },
  {
    id: "RES-004",
    name: "Safety Boots",
    category: "Rescue & Disaster Response",
    defaultUnit: "pairs",
  },
  {
    id: "RES-005",
    name: "Reflective Vest",
    category: "Rescue & Disaster Response",
    defaultUnit: "pieces",
  },

  // WASH
  {
    id: "WAS-001",
    name: "Handwashing Station",
    category: "WASH",
    defaultUnit: "pieces",
  },
  {
    id: "WAS-002",
    name: "Water Tank",
    category: "WASH",
    defaultUnit: "pieces",
  },
  {
    id: "WAS-003",
    name: "Water Treatment Kit",
    category: "WASH",
    defaultUnit: "kits",
  },

  // CHILD & FAMILY
  {
    id: "CHF-001",
    name: "Baby Kit",
    category: "Child & Family Support",
    defaultUnit: "kits",
  },
  {
    id: "CHF-002",
    name: "Baby Diapers",
    category: "Child & Family Support",
    defaultUnit: "packs",
  },
  {
    id: "CHF-003",
    name: "Child Protection Kit",
    category: "Child & Family Support",
    defaultUnit: "kits",
  },

  // COMMUNICATION
  {
    id: "COM-001",
    name: "Handheld Radio",
    category: "Communication",
    defaultUnit: "pieces",
  },
  {
    id: "COM-002",
    name: "Radio Battery",
    category: "Communication",
    defaultUnit: "pieces",
  },
  {
    id: "COM-003",
    name: "Megaphone",
    category: "Communication",
    defaultUnit: "pieces",
  },

  // POWER
  {
    id: "PWR-001",
    name: "Solar Lantern",
    category: "Lighting & Power",
    defaultUnit: "pieces",
  },
  {
    id: "PWR-002",
    name: "Rechargeable Torch",
    category: "Lighting & Power",
    defaultUnit: "pieces",
  },
  {
    id: "PWR-003",
    name: "Power Bank",
    category: "Lighting & Power",
    defaultUnit: "pieces",
  },

  // TOOLS
  {
    id: "TLS-001",
    name: "Shovel",
    category: "Tools & Equipment",
    defaultUnit: "pieces",
  },
  {
    id: "TLS-002",
    name: "Wheelbarrow",
    category: "Tools & Equipment",
    defaultUnit: "pieces",
  },
  {
    id: "TLS-003",
    name: "Hammer",
    category: "Tools & Equipment",
    defaultUnit: "pieces",
  },
  {
    id: "TLS-004",
    name: "Tool Kit",
    category: "Tools & Equipment",
    defaultUnit: "kits",
  },
];

export const DONOR_OPTIONS = [
  "Kenya Red Cross",
  "International Federation of Red Cross and Red Crescent Societies (IFRC)",
  "International Committee of the Red Cross (ICRC)",
  "Government of Kenya",
  "County Government",
  "United Nations Agency",
  "World Food Programme (WFP)",
  "UNICEF",
  "UNHCR",
  "NGO Partner",
  "Corporate Donor",
  "Community Donation",
  "Individual Donor",
  "Partner Organization",
  "Other",
] as const;

export const WAREHOUSE_TYPES = [
  "Central Warehouse",
  "Regional Warehouse",
  "County Warehouse",
  "Sub-County Warehouse",
  "Emergency Warehouse",
  "Relief Distribution Centre",
  "Temporary Storage Facility",
  "Mobile/Field Store",
] as const;

export const STOCK_UNITS = [
  "pieces",
  "kits",
  "sets",
  "bags",
  "boxes",
  "cartons",
  "packs",
  "bundles",
  "pairs",
  "litres",
  "rolls",
  "bottles",
  "containers",
  "tonnes",
] as const;

export const STOCK_STATUSES = [
  "Available",
  "Reserved",
  "Dispatched",
  "In Transit",
  "Delivered",
  "Damaged",
  "Lost",
  "Expired",
  "Quarantined",
] as const;

export const TRANSACTION_TYPES = [
  "Receive",
  "Issue",
  "Reserve",
  "Emergency Reserve",
  "Transfer",
  "Dispatch",
  "Return",
  "Adjustment",
  "Damage",
  "Loss",
  "Expiry",
] as const;

export const WAREHOUSE_STATUSES = [
  "Operational",
  "Temporarily Closed",
  "Full",
  "Under Maintenance",
  "Emergency Only",
] as const;

export const INCIDENT_PRIORITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;

export const ALERT_TYPES = [
  "Low Stock",
  "Critical Stock",
  "Near Expiry",
  "Expired",
  "Damaged",
  "Lost",
  "Pending Receiving",
  "Items In Transit",
] as const;

export const LOW_STOCK_DEFAULT_THRESHOLD = 20;

export const NEAR_EXPIRY_DAYS = 90;

/**
 * Internal batch identifiers are generated by the application.
 *
 * Example:
 * RC-WH01-20260814-0001
 */
export function generateBatchNumber(
  warehouseCode: string,
  sequence = 1,
  date = new Date(),
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const cleanWarehouseCode =
    warehouseCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "WH";

  return `RC-${cleanWarehouseCode}-${year}${month}${day}-${String(
    sequence,
  ).padStart(4, "0")}`;
}

/**
 * Generates a transaction reference.
 *
 * Example:
 * INV-RCV-20260814-0001
 */
export function generateTransactionNumber(
  type: string,
  sequence = 1,
  date = new Date(),
): string {
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const prefix = type
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);

  return `INV-${prefix || "TRX"}-${datePart}-${String(sequence).padStart(
    4,
    "0",
  )}`;
}

/**
 * Generate an internal warehouse code.
 *
 * Example:
 * WH-MSA-001
 */
export function generateWarehouseCode(
  countyCode: string,
  sequence = 1,
): string {
  const code =
    countyCode.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "KEN";

  return `WH-${code}-${String(sequence).padStart(3, "0")}`;
}

/**
 * Returns the list of supplies belonging to a category.
 */
export function getSuppliesByCategory(
  category: InventoryCategory,
): SupplyOption[] {
  return SUPPLY_OPTIONS.filter((item) => item.category === category);
}

/**
 * Finds a supply by its internal catalogue ID.
 */
export function getSupplyById(id: string): SupplyOption | undefined {
  return SUPPLY_OPTIONS.find((item) => item.id === id);
}

/**
 * Determines whether an item should normally require expiry tracking.
 */
export function requiresExpiryTracking(
  supplyId: string,
): boolean {
  const item = getSupplyById(supplyId);

  return Boolean(item?.expiryRequired);
}