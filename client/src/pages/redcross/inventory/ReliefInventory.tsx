import { useMemo, useState } from "react";
import {
  FaArchive,
  FaBoxes,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronRight,
  FaClipboardList,
  FaCloudDownloadAlt,
  FaExclamationTriangle,
  FaFileAlt,
  FaGlobeAfrica,
  FaHistory,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaTruck,
  FaWarehouse,
} from "react-icons/fa";

import {
  DONOR_OPTIONS,
  INVENTORY_CATEGORIES,
  LOW_STOCK_DEFAULT_THRESHOLD,
  NEAR_EXPIRY_DAYS,
  STOCK_STATUSES,
  TRANSACTION_TYPES,
  WAREHOUSE_STATUSES,
  WAREHOUSE_TYPES,
  SUPPLY_OPTIONS,
  generateBatchNumber,
  generateTransactionNumber,
  generateWarehouseCode,
} from "./constants";

type InventoryTab =
  | "dashboard"
  | "stock"
  | "warehouses"
  | "transactions"
  | "alerts"
  | "reports";

type ModalType =
  | "stock"
  | "warehouse"
  | "transaction"
  | "none";

type StockStatus = (typeof STOCK_STATUSES)[number];

interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  county: string;
  subCounty: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  utilization: number;
  responsibleOfficer: string;
  phone: string;
  status: string;
}

interface StockItem {
  id: string;
  supplyId: string;
  itemName: string;
  category: string;
  quantity: number;
  reserved: number;
  dispatched: number;
  damaged: number;
  lost: number;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  batchNumber: string;
  donor: string;
  receivedDate: string;
  expiryDate: string;
  status: StockStatus;
  reorderLevel: number;
  incidentId?: string;
}

interface Transaction {
  id: string;
  reference: string;
  type: string;
  itemName: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  warehouse: string;
  sourceDestination: string;
  donor: string;
  incidentId: string;
  responsiblePerson: string;
  timestamp: string;
  notes: string;
}

interface IncidentOption {
  id: string;
  title: string;
  location: string;
  priority: string;
}

const KENYA_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];

const SUB_COUNTIES: Record<string, string[]> = {
  Mombasa: [
    "Changamwe",
    "Jomvu",
    "Kisauni",
    "Likoni",
    "Mvita",
    "Nyali",
  ],
  Kilifi: [
    "Kilifi North",
    "Kilifi South",
    "Kaloleni",
    "Ganze",
    "Malindi",
    "Magarini",
    "Rabai",
  ],
  Kwale: [
    "Msambweni",
    "Lunga Lunga",
    "Matuga",
    "Kinango",
  ],
  "Taita Taveta": [
    "Voi",
    "Wundanyi",
    "Mwatate",
    "Taveta",
  ],
  Nairobi: [
    "Westlands",
    "Dagoretti North",
    "Dagoretti South",
    "Langata",
    "Kibra",
    "Roysambu",
    "Kasarani",
    "Ruaraka",
    "Embakasi",
  ],
};

const INCIDENTS: IncidentOption[] = [
  {
    id: "INC-001",
    title: "Flood Response – Mombasa",
    location: "Mombasa",
    priority: "Critical",
  },
  {
    id: "INC-002",
    title: "Community Displacement – Kilifi",
    location: "Kilifi",
    priority: "High",
  },
  {
    id: "INC-003",
    title: "Fire Relief Operation",
    location: "Mombasa",
    priority: "High",
  },
];

const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: "WH-001",
    code: "WH-MSA-001",
    name: "Mombasa County Relief Warehouse",
    type: "County Warehouse",
    county: "Mombasa",
    subCounty: "Changamwe",
    location: "Mombasa",
    latitude: -4.0435,
    longitude: 39.6682,
    capacity: 10000,
    utilization: 6400,
    responsibleOfficer: "Operations Officer",
    phone: "+254 700 000 001",
    status: "Operational",
  },
  {
    id: "WH-002",
    code: "WH-KLF-001",
    name: "Kilifi Emergency Store",
    type: "Emergency Warehouse",
    county: "Kilifi",
    subCounty: "Kilifi North",
    location: "Kilifi",
    latitude: -3.6305,
    longitude: 39.8499,
    capacity: 6000,
    utilization: 2800,
    responsibleOfficer: "County Logistics Officer",
    phone: "+254 700 000 002",
    status: "Operational",
  },
];

const INITIAL_STOCK: StockItem[] = [
  {
    id: "STK-001",
    supplyId: "FOOD-001",
    itemName: "Maize Flour",
    category: "Food",
    quantity: 850,
    reserved: 150,
    dispatched: 100,
    damaged: 10,
    lost: 0,
    unit: "bags",
    warehouseId: "WH-001",
    warehouseName: "Mombasa County Relief Warehouse",
    batchNumber: "RC-WHMSA001-20260814-0001",
    donor: "Kenya Red Cross",
    receivedDate: "2026-08-01",
    expiryDate: "",
    status: "Available",
    reorderLevel: 200,
  },
  {
    id: "STK-002",
    supplyId: "SHL-001",
    itemName: "Family Tent",
    category: "Shelter",
    quantity: 180,
    reserved: 30,
    dispatched: 40,
    damaged: 3,
    lost: 0,
    unit: "pieces",
    warehouseId: "WH-001",
    warehouseName: "Mombasa County Relief Warehouse",
    batchNumber: "RC-WHMSA001-20260814-0002",
    donor: "IFRC",
    receivedDate: "2026-07-20",
    expiryDate: "",
    status: "Available",
    reorderLevel: 50,
  },
  {
    id: "STK-003",
    supplyId: "HYG-001",
    itemName: "Family Hygiene Kit",
    category: "Hygiene",
    quantity: 75,
    reserved: 20,
    dispatched: 10,
    damaged: 2,
    lost: 0,
    unit: "kits",
    warehouseId: "WH-002",
    warehouseName: "Kilifi Emergency Store",
    batchNumber: "RC-WHKLF001-20260814-0001",
    donor: "UNICEF",
    receivedDate: "2026-07-15",
    expiryDate: "2026-10-15",
    status: "Available",
    reorderLevel: 100,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-001",
    reference: "INV-RCV-20260801-0001",
    type: "Receive",
    itemName: "Maize Flour",
    quantity: 1000,
    unit: "bags",
    batchNumber: "RC-WHMSA001-20260814-0001",
    warehouse: "Mombasa County Relief Warehouse",
    sourceDestination: "Kenya Red Cross National Store",
    donor: "Kenya Red Cross",
    incidentId: "",
    responsiblePerson: "Inventory Officer",
    timestamp: "2026-08-01 09:20",
    notes: "Routine stock replenishment",
  },
];

const EMPTY_STOCK_FORM = {
  supplyId: "",
  quantity: "",
  warehouseId: "",
  donor: "",
  receivedDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  reorderLevel: String(LOW_STOCK_DEFAULT_THRESHOLD),
  incidentId: "",
  notes: "",
};

const EMPTY_WAREHOUSE_FORM = {
  name: "",
  type: "",
  county: "",
  subCounty: "",
  location: "",
  latitude: "",
  longitude: "",
  capacity: "",
  responsibleOfficer: "",
  phone: "",
  status: "Operational",
};

const EMPTY_TRANSACTION_FORM = {
  type: "Receive",
  stockId: "",
  quantity: "",
  sourceDestination: "",
  incidentId: "",
  notes: "",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-KE").format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isNearExpiry(expiryDate: string) {
  if (!expiryDate) return false;

  const expiry = new Date(expiryDate).getTime();
  const now = new Date().getTime();
  const days = (expiry - now) / (1000 * 60 * 60 * 24);

  return days >= 0 && days <= NEAR_EXPIRY_DAYS;
}

function isExpired(expiryDate: string) {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < new Date().getTime();
}

export default function ReliefInventory() {
  const [activeTab, setActiveTab] =
    useState<InventoryTab>("dashboard");

  const [warehouses, setWarehouses] =
    useState<Warehouse[]>(INITIAL_WAREHOUSES);

  const [stock, setStock] =
    useState<StockItem[]>(INITIAL_STOCK);

  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [warehouseFilter, setWarehouseFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [modal, setModal] =
    useState<ModalType>("none");

  const [selectedStock, setSelectedStock] =
    useState<StockItem | null>(null);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState<Warehouse | null>(null);

  const [stockForm, setStockForm] =
    useState(EMPTY_STOCK_FORM);

  const [warehouseForm, setWarehouseForm] =
    useState(EMPTY_WAREHOUSE_FORM);

  const [transactionForm, setTransactionForm] =
    useState(EMPTY_TRANSACTION_FORM);

  const [notice, setNotice] =
    useState<string | null>(null);

  const availableStock = useMemo(
    () =>
      stock.reduce(
        (sum, item) =>
          sum +
          Math.max(
            item.quantity -
              item.reserved -
              item.dispatched -
              item.damaged -
              item.lost,
            0,
          ),
        0,
      ),
    [stock],
  );

  const totalStock = useMemo(
    () =>
      stock.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
    [stock],
  );

  const reservedStock = useMemo(
    () =>
      stock.reduce(
        (sum, item) => sum + item.reserved,
        0,
      ),
    [stock],
  );

  const dispatchedStock = useMemo(
    () =>
      stock.reduce(
        (sum, item) => sum + item.dispatched,
        0,
      ),
    [stock],
  );

  const damagedStock = useMemo(
    () =>
      stock.reduce(
        (sum, item) => sum + item.damaged,
        0,
      ),
    [stock],
  );

  const lowStockItems = useMemo(
    () =>
      stock.filter(
        (item) =>
          item.quantity -
            item.reserved -
            item.dispatched <=
          item.reorderLevel,
      ),
    [stock],
  );

  const expiredItems = useMemo(
    () =>
      stock.filter((item) =>
        isExpired(item.expiryDate),
      ),
    [stock],
  );

  const nearExpiryItems = useMemo(
    () =>
      stock.filter((item) =>
        isNearExpiry(item.expiryDate),
      ),
    [stock],
  );

  const filteredStock = useMemo(() => {
    const q = search.trim().toLowerCase();

    return stock.filter((item) => {
      const matchesSearch =
        !q ||
        item.itemName.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.donor.toLowerCase().includes(q) ||
        item.warehouseName.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesWarehouse =
        warehouseFilter === "All" ||
        item.warehouseId === warehouseFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus
      );
    });
  }, [
    stock,
    search,
    categoryFilter,
    warehouseFilter,
    statusFilter,
  ]);

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  }

  function openGoogleMaps(
    latitude: number,
    longitude: number,
  ) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function saveWarehouse() {
    if (
      !warehouseForm.name ||
      !warehouseForm.type ||
      !warehouseForm.county ||
      !warehouseForm.subCounty ||
      !warehouseForm.capacity
    ) {
      showNotice(
        "Please complete all required warehouse fields.",
      );
      return;
    }

    const countyCode =
      warehouseForm.county
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 3)
        .toUpperCase() || "KEN";

    const code = generateWarehouseCode(
      countyCode,
      warehouses.length + 1,
    );

    const warehouse: Warehouse = {
      id: `WH-${String(
        warehouses.length + 1,
      ).padStart(3, "0")}`,
      code,
      name: warehouseForm.name,
      type: warehouseForm.type,
      county: warehouseForm.county,
      subCounty: warehouseForm.subCounty,
      location:
        warehouseForm.location ||
        `${warehouseForm.subCounty}, ${warehouseForm.county}`,
      latitude: Number(
        warehouseForm.latitude || 0,
      ),
      longitude: Number(
        warehouseForm.longitude || 0,
      ),
      capacity: Number(warehouseForm.capacity),
      utilization: 0,
      responsibleOfficer:
        warehouseForm.responsibleOfficer,
      phone: warehouseForm.phone,
      status: warehouseForm.status,
    };

    setWarehouses((current) => [
      ...current,
      warehouse,
    ]);

    setWarehouseForm(EMPTY_WAREHOUSE_FORM);
    setModal("none");

    showNotice(
      `Warehouse ${code} registered successfully.`,
    );
  }

  function saveStock() {
    const supply = SUPPLY_OPTIONS.find(
      (item) => item.id === stockForm.supplyId,
    );

    const warehouse = warehouses.find(
      (item) => item.id === stockForm.warehouseId,
    );

    if (
      !supply ||
      !warehouse ||
      !stockForm.quantity ||
      !stockForm.donor
    ) {
      showNotice(
        "Select a supply, warehouse, quantity and donor.",
      );
      return;
    }

    const existing = stock.find(
      (item) =>
        item.supplyId === supply.id &&
        item.warehouseId === warehouse.id &&
        item.donor === stockForm.donor,
    );

    if (existing) {
      setStock((current) =>
        current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity:
                  item.quantity +
                  Number(stockForm.quantity),
              }
            : item,
        ),
      );

      showNotice(
        "Existing stock record updated.",
      );
    } else {
      const batch = generateBatchNumber(
        warehouse.code,
        stock.length + 1,
      );

      const newStock: StockItem = {
        id: `STK-${String(
          stock.length + 1,
        ).padStart(3, "0")}`,
        supplyId: supply.id,
        itemName: supply.name,
        category: supply.category,
        quantity: Number(stockForm.quantity),
        reserved: 0,
        dispatched: 0,
        damaged: 0,
        lost: 0,
        unit: supply.defaultUnit,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        batchNumber: batch,
        donor: stockForm.donor,
        receivedDate: stockForm.receivedDate,
        expiryDate:
          stockForm.expiryDate,
        status: "Available",
        reorderLevel:
          Number(stockForm.reorderLevel) ||
          LOW_STOCK_DEFAULT_THRESHOLD,
        incidentId:
          stockForm.incidentId || undefined,
      };

      setStock((current) => [
        ...current,
        newStock,
      ]);

      const transaction: Transaction = {
        id: `TRX-${String(
          transactions.length + 1,
        ).padStart(3, "0")}`,
        reference: generateTransactionNumber(
          "Receive",
          transactions.length + 1,
        ),
        type: "Receive",
        itemName: supply.name,
        quantity: Number(stockForm.quantity),
        unit: supply.defaultUnit,
        batchNumber: batch,
        warehouse: warehouse.name,
        sourceDestination: "Stock Receiving",
        donor: stockForm.donor,
        incidentId:
          stockForm.incidentId,
        responsiblePerson: "Current Inventory Officer",
        timestamp: new Date().toLocaleString(),
        notes: stockForm.notes,
      };

      setTransactions((current) => [
        transaction,
        ...current,
      ]);

      showNotice(
        `Stock received successfully. Batch ${batch} generated automatically.`,
      );
    }

    setStockForm(EMPTY_STOCK_FORM);
    setModal("none");
  }

  function processTransaction() {
    const item = stock.find(
      (record) =>
        record.id === transactionForm.stockId,
    );

    if (!item || !transactionForm.quantity) {
      showNotice(
        "Select a stock item and quantity.",
      );
      return;
    }

    const quantity = Number(
      transactionForm.quantity,
    );

    if (quantity <= 0) {
      showNotice("Quantity must be greater than zero.");
      return;
    }

    const available =
      item.quantity -
      item.reserved -
      item.dispatched -
      item.damaged -
      item.lost;

    if (
      [
        "Issue",
        "Dispatch",
        "Reserve",
        "Emergency Reserve",
        "Transfer",
      ].includes(transactionForm.type) &&
      quantity > available
    ) {
      showNotice(
        `Insufficient available stock. Available: ${available}.`,
      );
      return;
    }

    setStock((current) =>
      current.map((record) => {
        if (record.id !== item.id) {
          return record;
        }

        const updated = { ...record };

        switch (transactionForm.type) {
          case "Reserve":
          case "Emergency Reserve":
            updated.reserved += quantity;
            break;

          case "Dispatch":
          case "Issue":
            updated.dispatched += quantity;
            break;

          case "Return":
            updated.dispatched = Math.max(
              0,
              updated.dispatched - quantity,
            );
            break;

          case "Damage":
            updated.damaged += quantity;
            break;

          case "Loss":
            updated.lost += quantity;
            break;

          case "Adjustment":
            updated.quantity = quantity;
            break;

          default:
            break;
        }

        return updated;
      }),
    );

    const transaction: Transaction = {
      id: `TRX-${String(
        transactions.length + 1,
      ).padStart(3, "0")}`,
      reference: generateTransactionNumber(
        transactionForm.type,
        transactions.length + 1,
      ),
      type: transactionForm.type,
      itemName: item.itemName,
      quantity,
      unit: item.unit,
      batchNumber: item.batchNumber,
      warehouse: item.warehouseName,
      sourceDestination:
        transactionForm.sourceDestination,
      donor: item.donor,
      incidentId:
        transactionForm.incidentId,
      responsiblePerson:
        "Current Inventory Officer",
      timestamp: new Date().toLocaleString(),
      notes: transactionForm.notes,
    };

    setTransactions((current) => [
      transaction,
      ...current,
    ]);

    setTransactionForm(
      EMPTY_TRANSACTION_FORM,
    );

    setModal("none");

    showNotice(
      `${transactionForm.type} transaction recorded successfully.`,
    );
  }

  function exportCSV() {
    const headers = [
      "Item",
      "Category",
      "Quantity",
      "Reserved",
      "Dispatched",
      "Damaged",
      "Lost",
      "Unit",
      "Warehouse",
      "Batch",
      "Donor",
      "Received",
      "Expiry",
      "Status",
      "Reorder Level",
    ];

    const rows = filteredStock.map((item) => [
      item.itemName,
      item.category,
      item.quantity,
      item.reserved,
      item.dispatched,
      item.damaged,
      item.lost,
      item.unit,
      item.warehouseName,
      item.batchNumber,
      item.donor,
      item.receivedDate,
      item.expiryDate,
      item.status,
      item.reorderLevel,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""',
            )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `redcross-inventory-${today()}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);

    showNotice("Inventory CSV exported.");
  }

  function printReport() {
    window.print();
  }

  const tabs: {
    id: InventoryTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaBoxes />,
    },
    {
      id: "stock",
      label: "Supplies & Stock",
      icon: <FaArchive />,
    },
    {
      id: "warehouses",
      label: "Warehouses",
      icon: <FaWarehouse />,
    },
    {
      id: "transactions",
      label: "Stock Operations",
      icon: <FaHistory />,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: <FaExclamationTriangle />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FaFileAlt />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {notice && (
        <div className="fixed right-5 top-5 z-[100] flex max-w-md items-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-2xl">
          <FaCheckCircle className="text-emerald-400" />
          {notice}
        </div>
      )}

      <header className="bg-red-700 px-4 py-5 text-white shadow-lg sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/15 p-3">
              <FaBoxes size={26} />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-red-100">
                Kenya Red Cross
              </div>

              <h1 className="text-xl font-bold sm:text-2xl">
                Relief Inventory & Logistics
              </h1>

              <p className="mt-1 text-sm text-red-100">
                Stock visibility, warehouse control,
                traceability and emergency allocation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setModal("warehouse");
              }}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow"
            >
              <FaPlus />
              Register Warehouse
            </button>

            <button
              onClick={() => {
                setModal("stock");
              }}
              className="flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2.5 text-sm font-bold text-white"
            >
              <FaPlus />
              Receive Stock
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-red-50 text-red-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "dashboard" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Stock"
                value={formatNumber(totalStock)}
                icon={<FaBoxes />}
                tone="red"
              />

              <MetricCard
                label="Available"
                value={formatNumber(availableStock)}
                icon={<FaCheckCircle />}
                tone="green"
              />

              <MetricCard
                label="Reserved"
                value={formatNumber(reservedStock)}
                icon={<FaShieldAlt />}
                tone="amber"
              />

              <MetricCard
                label="Dispatched"
                value={formatNumber(dispatchedStock)}
                icon={<FaTruck />}
                tone="blue"
              />
            </section>

            <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Low Stock"
                value={formatNumber(
                  lowStockItems.length,
                )}
                icon={<FaExclamationTriangle />}
                tone="amber"
              />

              <MetricCard
                label="Near Expiry"
                value={formatNumber(
                  nearExpiryItems.length,
                )}
                icon={<FaCalendarAlt />}
                tone="orange"
              />

              <MetricCard
                label="Expired"
                value={formatNumber(
                  expiredItems.length,
                )}
                icon={<FaTimes />}
                tone="red"
              />

              <MetricCard
                label="Damaged / Lost"
                value={formatNumber(
                  damagedStock,
                )}
                icon={<FaTrash />}
                tone="slate"
              />
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Inventory Health
                    </h2>
                    <p className="text-sm text-slate-500">
                      Current operational stock position
                    </p>
                  </div>

                  <FaArchive className="text-red-600" />
                </div>

                <div className="mt-5 space-y-4">
                  <HealthBar
                    label="Available"
                    value={availableStock}
                    total={Math.max(totalStock, 1)}
                  />

                  <HealthBar
                    label="Reserved"
                    value={reservedStock}
                    total={Math.max(totalStock, 1)}
                  />

                  <HealthBar
                    label="Dispatched"
                    value={dispatchedStock}
                    total={Math.max(totalStock, 1)}
                  />
                </div>
              </section>

              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Active Alerts
                    </h2>
                    <p className="text-sm text-slate-500">
                      Requires operational attention
                    </p>
                  </div>

                  <FaExclamationTriangle className="text-amber-500" />
                </div>

                <div className="mt-5 space-y-3">
                  <AlertRow
                    label="Low stock items"
                    value={lowStockItems.length}
                    onClick={() =>
                      setActiveTab("alerts")
                    }
                  />

                  <AlertRow
                    label="Near expiry"
                    value={nearExpiryItems.length}
                    onClick={() =>
                      setActiveTab("alerts")
                    }
                  />

                  <AlertRow
                    label="Expired"
                    value={expiredItems.length}
                    onClick={() =>
                      setActiveTab("alerts")
                    }
                  />

                  <AlertRow
                    label="Damaged / lost"
                    value={damagedStock}
                    onClick={() =>
                      setActiveTab("alerts")
                    }
                  />
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-bold text-slate-900">
                  Warehouse Utilization
                </h2>
                <p className="text-sm text-slate-500">
                  Current reported storage utilization
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                {warehouses.map((warehouse) => {
                  const percentage =
                    warehouse.capacity > 0
                      ? Math.round(
                          (warehouse.utilization /
                            warehouse.capacity) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={warehouse.id}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">
                            {warehouse.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {warehouse.code} •{" "}
                            {warehouse.county}
                          </div>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {warehouse.status}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs">
                          <span>Utilization</span>
                          <span className="font-bold">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-red-600"
                            style={{
                              width: `${Math.min(
                                percentage,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openGoogleMaps(
                            warehouse.latitude,
                            warehouse.longitude,
                          )
                        }
                        className="mt-4 flex items-center gap-2 text-sm font-semibold text-red-700"
                      >
                        <FaMapMarkerAlt />
                        Open GIS location
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === "stock" && (
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Supplies & Stock
                  </h2>
                  <p className="text-sm text-slate-500">
                    Search, trace and manage relief
                    supplies.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
                  >
                    <FaCloudDownloadAlt />
                    CSV
                  </button>

                  <button
                    onClick={() => setModal("stock")}
                    className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white"
                  >
                    <FaPlus />
                    Receive Stock
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search item, batch, donor..."
                    className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border px-3 py-2.5 text-sm"
                >
                  <option value="All">
                    All categories
                  </option>

                  {INVENTORY_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ),
                  )}
                </select>

                <select
                  value={warehouseFilter}
                  onChange={(event) =>
                    setWarehouseFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border px-3 py-2.5 text-sm"
                >
                  <option value="All">
                    All warehouses
                  </option>

                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border px-3 py-2.5 text-sm"
                >
                  <option value="All">
                    All statuses
                  </option>

                  {STOCK_STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Supply
                    </th>
                    <th className="px-5 py-3">
                      Quantity
                    </th>
                    <th className="px-5 py-3">
                      Warehouse
                    </th>
                    <th className="px-5 py-3">
                      Batch
                    </th>
                    <th className="px-5 py-3">
                      Donor
                    </th>
                    <th className="px-5 py-3">
                      Expiry
                    </th>
                    <th className="px-5 py-3">
                      Status
                    </th>
                    <th className="px-5 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredStock.map((item) => {
                    const available =
                      item.quantity -
                      item.reserved -
                      item.dispatched -
                      item.damaged -
                      item.lost;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold">
                            {item.itemName}
                          </div>

                          <div className="text-xs text-slate-500">
                            {item.category} •{" "}
                            {item.unit}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold">
                            {formatNumber(
                              item.quantity,
                            )}
                          </div>

                          <div className="text-xs text-emerald-600">
                            {formatNumber(
                              available,
                            )}{" "}
                            available
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {item.warehouseName}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs">
                          {item.batchNumber}
                        </td>

                        <td className="px-5 py-4">
                          {item.donor}
                        </td>

                        <td className="px-5 py-4">
                          {item.expiryDate || "N/A"}

                          {isExpired(
                            item.expiryDate,
                          ) && (
                            <div className="text-xs font-bold text-red-600">
                              Expired
                            </div>
                          )}

                          {!isExpired(
                            item.expiryDate,
                          ) &&
                            isNearExpiry(
                              item.expiryDate,
                            ) && (
                              <div className="text-xs font-bold text-amber-600">
                                Near expiry
                              </div>
                            )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={item.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => {
                              setSelectedStock(item);
                            }}
                            className="font-semibold text-red-700 hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "warehouses" && (
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Warehouse Management
                </h2>

                <p className="text-sm text-slate-500">
                  Register and monitor operational
                  relief storage locations.
                </p>
              </div>

              <button
                onClick={() =>
                  setModal("warehouse")
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white"
              >
                <FaPlus />
                Register Warehouse
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-2">
              {warehouses.map((warehouse) => {
                const percentage =
                  warehouse.capacity
                    ? Math.round(
                        (warehouse.utilization /
                          warehouse.capacity) *
                          100,
                      )
                    : 0;

                return (
                  <article
                    key={warehouse.id}
                    className="rounded-2xl border p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-50 p-3 text-red-700">
                          <FaWarehouse />
                        </div>

                        <div>
                          <h3 className="font-bold">
                            {warehouse.name}
                          </h3>

                          <p className="text-xs text-slate-500">
                            {warehouse.code} •{" "}
                            {warehouse.type}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={warehouse.status}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <InfoBox
                        label="County"
                        value={warehouse.county}
                      />

                      <InfoBox
                        label="Sub-county"
                        value={
                          warehouse.subCounty
                        }
                      />

                      <InfoBox
                        label="Capacity"
                        value={`${formatNumber(
                          warehouse.capacity,
                        )} units`}
                      />

                      <InfoBox
                        label="Utilization"
                        value={`${percentage}%`}
                      />

                      <InfoBox
                        label="Responsible officer"
                        value={
                          warehouse.responsibleOfficer ||
                          "Not assigned"
                        }
                      />

                      <InfoBox
                        label="Contact"
                        value={
                          warehouse.phone ||
                          "Not provided"
                        }
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedWarehouse(
                            warehouse,
                          );
                        }}
                        className="rounded-lg border px-3 py-2 text-sm font-semibold"
                      >
                        View profile
                      </button>

                      <button
                        onClick={() =>
                          openGoogleMaps(
                            warehouse.latitude,
                            warehouse.longitude,
                          )
                        }
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                      >
                        <FaMapMarkerAlt />
                        Open GIS / Maps
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "transactions" && (
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Stock Operations
                </h2>

                <p className="text-sm text-slate-500">
                  Receive, issue, reserve, transfer,
                  dispatch, return and adjust stock.
                </p>
              </div>

              <button
                onClick={() =>
                  setModal("transaction")
                }
                className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white"
              >
                <FaSyncAlt />
                New Operation
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Reference
                    </th>
                    <th className="px-5 py-3">
                      Operation
                    </th>
                    <th className="px-5 py-3">
                      Item
                    </th>
                    <th className="px-5 py-3">
                      Quantity
                    </th>
                    <th className="px-5 py-3">
                      Warehouse
                    </th>
                    <th className="px-5 py-3">
                      Incident
                    </th>
                    <th className="px-5 py-3">
                      Responsible
                    </th>
                    <th className="px-5 py-3">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                      >
                        <td className="px-5 py-4 font-mono text-xs">
                          {transaction.reference}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                            {transaction.type}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {transaction.itemName}
                        </td>

                        <td className="px-5 py-4">
                          {formatNumber(
                            transaction.quantity,
                          )}{" "}
                          {transaction.unit}
                        </td>

                        <td className="px-5 py-4">
                          {transaction.warehouse}
                        </td>

                        <td className="px-5 py-4">
                          {transaction.incidentId ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          {transaction.responsiblePerson}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {transaction.timestamp}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "alerts" && (
          <section className="space-y-5">
            <AlertSection
              title="Low-stock alerts"
              description="Items at or below their configured reorder threshold."
              items={lowStockItems.map(
                (item) => ({
                  id: item.id,
                  title: item.itemName,
                  description: `${item.warehouseName} • ${item.quantity} ${item.unit} remaining`,
                  severity: "Warning",
                }),
              )}
            />

            <AlertSection
              title="Near-expiry stock"
              description={`Items approaching expiry within ${NEAR_EXPIRY_DAYS} days.`}
              items={nearExpiryItems.map(
                (item) => ({
                  id: item.id,
                  title: item.itemName,
                  description: `${item.batchNumber} • expiry ${item.expiryDate}`,
                  severity: "Warning",
                }),
              )}
            />

            <AlertSection
              title="Expired stock"
              description="Items requiring quarantine or disposal assessment."
              items={expiredItems.map(
                (item) => ({
                  id: item.id,
                  title: item.itemName,
                  description: `${item.batchNumber} • ${item.warehouseName}`,
                  severity: "Critical",
                }),
              )}
            />
          </section>
        )}

        {activeTab === "reports" && (
          <section className="grid gap-5 lg:grid-cols-2">
            <ReportCard
              title="Inventory Summary"
              description="Current total, available, reserved, dispatched and damaged stock."
              icon={<FaBoxes />}
              onCSV={exportCSV}
              onPrint={printReport}
            />

            <ReportCard
              title="Stock Movement"
              description="Complete receiving, issuing, transfer, reservation and dispatch history."
              icon={<FaHistory />}
              onCSV={exportCSV}
              onPrint={printReport}
            />

            <ReportCard
              title="Low Stock Report"
              description="Supplies requiring replenishment based on reorder thresholds."
              icon={<FaExclamationTriangle />}
              onCSV={exportCSV}
              onPrint={printReport}
            />

            <ReportCard
              title="Warehouse Report"
              description="Registered warehouses, capacity, utilization and operational status."
              icon={<FaWarehouse />}
              onCSV={exportCSV}
              onPrint={printReport}
            />

            <ReportCard
              title="Dispatch Report"
              description="Relief stock dispatched to operational activities and incidents."
              icon={<FaTruck />}
              onCSV={exportCSV}
              onPrint={printReport}
            />

            <ReportCard
              title="Donations & Sources"
              description="Trace inventory back to donors and receiving records."
              icon={<FaClipboardList />}
              onCSV={exportCSV}
              onPrint={printReport}
            />
          </section>
        )}
      </main>

      {modal === "warehouse" && (
        <Modal
          title="Register Relief Warehouse"
          onClose={() => {
            setModal("none");
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Warehouse name *"
              value={warehouseForm.name}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  name: value,
                })
              }
              placeholder="e.g. Mombasa County Relief Warehouse"
            />

            <SelectField
              label="Warehouse type *"
              value={warehouseForm.type}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  type: value,
                })
              }
              options={WAREHOUSE_TYPES}
            />

            <SelectField
              label="County *"
              value={warehouseForm.county}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  county: value,
                  subCounty: "",
                })
              }
              options={KENYA_COUNTIES}
            />

            <SelectField
              label="Sub-county *"
              value={warehouseForm.subCounty}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  subCounty: value,
                })
              }
              options={
                SUB_COUNTIES[
                  warehouseForm.county
                ] || [
                  "Select from registered county sub-counties",
                ]
              }
            />

            <Field
              label="Location / address"
              value={warehouseForm.location}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  location: value,
                })
              }
              placeholder="Facility or physical location"
            />

            <Field
              label="Storage capacity *"
              type="number"
              value={warehouseForm.capacity}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  capacity: value,
                })
              }
              placeholder="Total capacity"
            />

            <Field
              label="Latitude"
              type="number"
              value={warehouseForm.latitude}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  latitude: value,
                })
              }
              placeholder="-4.0435"
            />

            <Field
              label="Longitude"
              type="number"
              value={warehouseForm.longitude}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  longitude: value,
                })
              }
              placeholder="39.6682"
            />

            <Field
              label="Responsible officer"
              value={
                warehouseForm.responsibleOfficer
              }
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  responsibleOfficer: value,
                })
              }
              placeholder="Officer name"
            />

            <Field
              label="Contact"
              value={warehouseForm.phone}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  phone: value,
                })
              }
              placeholder="+254..."
            />

            <SelectField
              label="Operational status"
              value={warehouseForm.status}
              onChange={(value) =>
                setWarehouseForm({
                  ...warehouseForm,
                  status: value,
                })
              }
              options={WAREHOUSE_STATUSES}
            />
          </div>

          <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            <strong>GIS:</strong> Once latitude and
            longitude are recorded, the warehouse can
            be opened directly in Google Maps and
            later connected to the Jamii GIS command
            centre.
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setModal("none")}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={saveWarehouse}
              className="rounded-lg bg-red-700 px-5 py-2 text-sm font-bold text-white"
            >
              Register Warehouse
            </button>
          </div>
        </Modal>
      )}

      {modal === "stock" && (
        <Modal
          title="Receive New Relief Stock"
          onClose={() => setModal("none")}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Supply / item *"
              value={stockForm.supplyId}
              onChange={(value) => {
                setStockForm({
                  ...stockForm,
                  supplyId: value,
                });
              }}
              options={SUPPLY_OPTIONS.map(
                (item) =>
                  `${item.id} — ${item.name} (${item.category})`,
              )}
              values={SUPPLY_OPTIONS.map(
                (item) => item.id,
              )}
            />

            <Field
              label="Quantity *"
              type="number"
              value={stockForm.quantity}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  quantity: value,
                })
              }
              placeholder="Quantity received"
            />

            <SelectField
              label="Warehouse *"
              value={stockForm.warehouseId}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  warehouseId: value,
                })
              }
              options={warehouses.map(
                (warehouse) =>
                  `${warehouse.code} — ${warehouse.name}`,
              )}
              values={warehouses.map(
                (warehouse) =>
                  warehouse.id,
              )}
            />

            <SelectField
              label="Donor / source *"
              value={stockForm.donor}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  donor: value,
                })
              }
              options={DONOR_OPTIONS}
            />

            <Field
              label="Receiving date"
              type="date"
              value={stockForm.receivedDate}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  receivedDate: value,
                })
              }
            />

            <Field
              label="Expiry date"
              type="date"
              value={stockForm.expiryDate}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  expiryDate: value,
                })
              }
            />

            <Field
              label="Reorder threshold"
              type="number"
              value={stockForm.reorderLevel}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  reorderLevel: value,
                })
              }
            />

            <SelectField
              label="Allocate to incident"
              value={stockForm.incidentId}
              onChange={(value) =>
                setStockForm({
                  ...stockForm,
                  incidentId: value,
                })
              }
              options={[
                "None",
                ...INCIDENTS.map(
                  (incident) =>
                    `${incident.id} — ${incident.title}`,
                ),
              ]}
              values={[
                "",
                ...INCIDENTS.map(
                  (incident) =>
                    incident.id,
                ),
              ]}
            />
          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <strong>Automatic batch control:</strong>{" "}
            the system generates a unique batch number
            when stock is received. The batch is linked
            to the warehouse, receiving date and stock
            record for traceability.
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setModal("none")}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={saveStock}
              className="rounded-lg bg-red-700 px-5 py-2 text-sm font-bold text-white"
            >
              Receive Stock
            </button>
          </div>
        </Modal>
      )}

      {modal === "transaction" && (
        <Modal
          title="New Stock Operation"
          onClose={() => setModal("none")}
        >
          <div className="grid gap-4">
            <SelectField
              label="Operation"
              value={transactionForm.type}
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  type: value,
                })
              }
              options={TRANSACTION_TYPES}
            />

            <SelectField
              label="Stock item"
              value={transactionForm.stockId}
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  stockId: value,
                })
              }
              options={stock.map(
                (item) =>
                  `${item.itemName} — ${item.batchNumber} — ${item.warehouseName}`,
              )}
              values={stock.map(
                (item) => item.id,
              )}
            />

            <Field
              label="Quantity"
              type="number"
              value={transactionForm.quantity}
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  quantity: value,
                })
              }
            />

            <Field
              label="Destination / source"
              value={
                transactionForm.sourceDestination
              }
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  sourceDestination:
                    value,
                })
              }
              placeholder="Destination, partner or source"
            />

            <SelectField
              label="Link to incident"
              value={transactionForm.incidentId}
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  incidentId: value,
                })
              }
              options={[
                "None",
                ...INCIDENTS.map(
                  (incident) =>
                    `${incident.id} — ${incident.title}`,
                ),
              ]}
              values={[
                "",
                ...INCIDENTS.map(
                  (incident) =>
                    incident.id,
                ),
              ]}
            />

            <label className="grid gap-2 text-sm font-semibold">
              Notes
              <textarea
                value={transactionForm.notes}
                onChange={(event) =>
                  setTransactionForm({
                    ...transactionForm,
                    notes: event.target.value,
                  })
                }
                rows={3}
                className="rounded-lg border px-3 py-2 font-normal outline-none focus:border-red-500"
                placeholder="Operational notes..."
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setModal("none")}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={processTransaction}
              className="rounded-lg bg-red-700 px-5 py-2 text-sm font-bold text-white"
            >
              Record Operation
            </button>
          </div>
        </Modal>
      )}

      {selectedStock && (
        <Modal
          title={selectedStock.itemName}
          onClose={() =>
            setSelectedStock(null)
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBox
              label="Category"
              value={selectedStock.category}
            />

            <InfoBox
              label="Batch"
              value={selectedStock.batchNumber}
            />

            <InfoBox
              label="Warehouse"
              value={
                selectedStock.warehouseName
              }
            />

            <InfoBox
              label="Donor"
              value={selectedStock.donor}
            />

            <InfoBox
              label="Total quantity"
              value={`${formatNumber(
                selectedStock.quantity,
              )} ${selectedStock.unit}`}
            />

            <InfoBox
              label="Reserved"
              value={formatNumber(
                selectedStock.reserved,
              )}
            />

            <InfoBox
              label="Dispatched"
              value={formatNumber(
                selectedStock.dispatched,
              )}
            />

            <InfoBox
              label="Damaged"
              value={formatNumber(
                selectedStock.damaged,
              )}
            />

            <InfoBox
              label="Lost"
              value={formatNumber(
                selectedStock.lost,
              )}
            />

            <InfoBox
              label="Received"
              value={
                selectedStock.receivedDate
              }
            />

            <InfoBox
              label="Expiry"
              value={
                selectedStock.expiryDate ||
                "Not applicable"
              }
            />

            <InfoBox
              label="Reorder level"
              value={formatNumber(
                selectedStock.reorderLevel,
              )}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedStock(null);
                setModal("transaction");
                setTransactionForm({
                  ...EMPTY_TRANSACTION_FORM,
                  stockId:
                    selectedStock.id,
                });
              }}
              className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white"
            >
              <FaSyncAlt />
              Stock operation
            </button>

            <button
              onClick={() =>
                setActiveTab("transactions")
              }
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              <FaHistory />
              View history
            </button>
          </div>
        </Modal>
      )}

      {selectedWarehouse && (
        <Modal
          title="Warehouse Profile"
          onClose={() =>
            setSelectedWarehouse(null)
          }
        >
          <div className="rounded-xl bg-red-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-red-600">
              Warehouse code
            </div>
            <div className="mt-1 text-xl font-bold text-red-800">
              {selectedWarehouse.code}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoBox
              label="Name"
              value={selectedWarehouse.name}
            />

            <InfoBox
              label="Type"
              value={selectedWarehouse.type}
            />

            <InfoBox
              label="County"
              value={
                selectedWarehouse.county
              }
            />

            <InfoBox
              label="Sub-county"
              value={
                selectedWarehouse.subCounty
              }
            />

            <InfoBox
              label="Location"
              value={
                selectedWarehouse.location
              }
            />

            <InfoBox
              label="Capacity"
              value={formatNumber(
                selectedWarehouse.capacity,
              )}
            />

            <InfoBox
              label="Responsible officer"
              value={
                selectedWarehouse.responsibleOfficer ||
                "Not assigned"
              }
            />

            <InfoBox
              label="Contact"
              value={
                selectedWarehouse.phone ||
                "Not provided"
              }
            />
          </div>

          <button
            onClick={() =>
              openGoogleMaps(
                selectedWarehouse.latitude,
                selectedWarehouse.longitude,
              )
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-3 text-sm font-bold text-white"
          >
            <FaGlobeAfrica />
            Open Warehouse on Google Maps
          </button>
        </Modal>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone:
    | "red"
    | "green"
    | "amber"
    | "blue"
    | "orange"
    | "slate";
}) {
  const tones = {
    red: "bg-red-50 text-red-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>

        <span
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-4 text-2xl font-black text-slate-900">
        {value}
      </div>
    </div>
  );
}

function HealthBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = Math.min(
    Math.round((value / total) * 100),
    100,
  );

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">
          {label}
        </span>
        <span className="font-bold">
          {percentage}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-red-600"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function AlertRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border p-3 text-left hover:bg-slate-50"
    >
      <span className="text-sm font-medium">
        {label}
      </span>

      <span className="flex items-center gap-2">
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
          {value}
        </span>
        <FaChevronRight className="text-xs text-slate-400" />
      </span>
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const critical = [
    "Expired",
    "Damaged",
    "Lost",
    "Full",
  ].includes(status);

  const warning = [
    "Reserved",
    "In Transit",
    "Emergency Only",
    "Under Maintenance",
  ].includes(status);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        critical
          ? "bg-red-50 text-red-700"
          : warning
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {status}
    </span>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="rounded-lg border px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  values,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  values?: string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="rounded-lg border bg-white px-3 py-2.5 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
      >
        <option value="">
          Select...
        </option>

        {options.map((option, index) => (
          <option
            key={`${option}-${index}`}
            value={
              values
                ? values[index]
                : option
            }
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function AlertSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: {
    id: string;
    title: string;
    description: string;
    severity: string;
  }[];
}) {
  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="divide-y">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No active alerts.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-5"
            >
              <div
                className={`rounded-xl p-3 ${
                  item.severity ===
                  "Critical"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <FaExclamationTriangle />
              </div>

              <div>
                <div className="font-bold">
                  {item.title}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {item.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ReportCard({
  title,
  description,
  icon,
  onCSV,
  onPrint,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onCSV: () => void;
  onPrint: () => void;
}) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-red-50 p-3 text-red-700">
          {icon}
        </div>

        <div className="flex-1">
          <h3 className="font-bold">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onCSV}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          <FaCloudDownloadAlt />
          CSV
        </button>

        <button
          onClick={onPrint}
          className="flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-sm font-bold text-white"
        >
          <FaFileAlt />
          Print / PDF
        </button>
      </div>
    </article>
  );
}