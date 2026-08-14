export type StockStatus =
  | "Healthy"
  | "Low"
  | "Critical"
  | "Out of Stock"
  | "Quarantined"
  | "Expired";

export type ItemCondition =
  | "New"
  | "Good"
  | "Used"
  | "Damaged"
  | "Expired";

export type InventoryCategory =
  | "Shelter & Household"
  | "WASH"
  | "Food & Nutrition"
  | "Health & First Aid"
  | "Clothing & Personal Items"
  | "Emergency & Rescue"
  | "Logistics & Warehouse"
  | "Other";

export type MovementType =
  | "Stock In"
  | "Stock Out"
  | "Reservation"
  | "Reservation Release"
  | "Transfer Out"
  | "Transfer In"
  | "Adjustment"
  | "Damage"
  | "Expiry"
  | "Distribution";

export type MovementReason =
  | "Donation"
  | "Procurement"
  | "Emergency Replenishment"
  | "Return"
  | "Relief Distribution"
  | "Incident Response"
  | "Warehouse Transfer"
  | "Damage"
  | "Expiry"
  | "Stock Reconciliation"
  | "Other";

export type WarehouseStatus =
  | "Operational"
  | "Limited"
  | "Temporarily Closed"
  | "Under Maintenance";

export type WarehouseType =
  | "Central Warehouse"
  | "Regional Warehouse"
  | "County Warehouse"
  | "Field Store"
  | "Emergency Store"
  | "Mobile Store";

export type ReliefRequestStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Picking"
  | "Packed"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type ReliefRequestPriority =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

export type DistributionStatus =
  | "Planned"
  | "Approved"
  | "Preparing"
  | "Dispatched"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type StockReservationStatus =
  | "Reserved"
  | "Released"
  | "Converted to Dispatch"
  | "Cancelled";

export type AlertSeverity =
  | "Critical"
  | "Warning"
  | "Info";

export interface InventoryItem {
  id: string;
  itemCode: string;
  ctn?: string;
  name: string;
  category: InventoryCategory;
  subcategory: string;
  description?: string;

  unitOfMeasure: string;

  quantityOnHand: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  expiredQuantity: number;
  quarantinedQuantity: number;

  minimumStock: number;
  reorderLevel: number;
  maximumStock: number;

  warehouseId: string;
  warehouseName: string;
  storageLocation?: string;

  batchNumber?: string;
  lotNumber?: string;

  receivedDate?: string;
  expiryDate?: string;

  condition: ItemCondition;
  status: StockStatus;

  donor?: string;
  supplier?: string;
  sourceType?: "Donation" | "Procurement" | "Transfer" | "Other";

  lastMovementDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StockBatch {
  id: string;
  itemId: string;
  itemName: string;

  batchNumber: string;
  lotNumber?: string;

  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;

  receivedDate: string;
  expiryDate?: string;

  supplier?: string;
  donor?: string;

  condition: ItemCondition;

  warehouseId: string;
  warehouseName: string;

  status: StockStatus;

  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;

  warehouseCode: string;
  name: string;

  type: WarehouseType;

  county: string;
  subCounty: string;

  physicalAddress?: string;

  latitude: number;
  longitude: number;

  managerName?: string;
  contactPhone?: string;
  contactEmail?: string;

  capacity: number;
  occupiedCapacity: number;

  utilizationPercentage: number;

  status: WarehouseStatus;

  securityStatus?: "Secure" | "Needs Attention" | "Restricted";

  lastInspectionDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;

  referenceNumber: string;

  itemId: string;
  itemCode: string;
  itemName: string;

  movementType: MovementType;
  reason: MovementReason;

  quantity: number;

  unitOfMeasure: string;

  fromWarehouseId?: string;
  fromWarehouseName?: string;

  toWarehouseId?: string;
  toWarehouseName?: string;

  batchNumber?: string;

  incidentId?: string;
  incidentReference?: string;

  reliefRequestId?: string;
  distributionId?: string;

  vehicleId?: string;
  driverId?: string;

  authorizedBy?: string;
  performedBy: string;

  notes?: string;

  timestamp: string;
}

export interface StockReservation {
  id: string;

  reservationNumber: string;

  itemId: string;
  itemName: string;

  quantity: number;

  warehouseId: string;
  warehouseName: string;

  reliefRequestId?: string;
  incidentId?: string;

  requestedBy: string;
  approvedBy?: string;

  status: StockReservationStatus;

  reservedAt: string;
  releasedAt?: string;

  notes?: string;
}

export interface ReliefRequestItem {
  itemId: string;
  itemCode: string;
  itemName: string;

  requestedQuantity: number;
  approvedQuantity: number;
  dispatchedQuantity: number;
  deliveredQuantity: number;

  unitOfMeasure: string;
}

export interface ReliefRequest {
  id: string;

  requestNumber: string;

  incidentId?: string;
  incidentReference?: string;

  operationName: string;

  requestedBy: string;

  requestingOrganization?: string;

  county: string;
  subCounty: string;
  location: string;

  priority: ReliefRequestPriority;

  status: ReliefRequestStatus;

  items: ReliefRequestItem[];

  householdsAffected?: number;
  peopleAffected?: number;

  requestedDate: string;
  requiredBy?: string;

  approvedBy?: string;
  approvedAt?: string;

  dispatchedAt?: string;
  deliveredAt?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DistributionItem {
  itemId: string;
  itemCode: string;
  itemName: string;

  quantity: number;

  unitOfMeasure: string;
}

export interface ReliefDistribution {
  id: string;

  distributionNumber: string;

  operationName: string;

  incidentId?: string;
  incidentReference?: string;

  reliefRequestId?: string;

  county: string;
  subCounty: string;
  location: string;

  beneficiaryGroup?: string;

  households: number;
  individuals: number;

  vulnerablePersons?: number;

  items: DistributionItem[];

  distributionTeam?: string;

  vehicleId?: string;
  driverId?: string;

  status: DistributionStatus;

  plannedDate: string;
  completedDate?: string;

  recipientName?: string;
  recipientContact?: string;

  acknowledgementReference?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DonationRecord {
  id: string;

  donationReference: string;

  donorName: string;

  donorType:
    | "Individual"
    | "Corporate"
    | "Government"
    | "NGO"
    | "International Organization"
    | "Other";

  contactPhone?: string;
  contactEmail?: string;

  itemId: string;
  itemName: string;

  quantity: number;

  unitOfMeasure: string;

  warehouseId: string;
  warehouseName: string;

  batchNumber?: string;

  receivedDate: string;

  estimatedValue?: number;
  currency?: string;

  acknowledgementIssued?: boolean;

  notes?: string;

  createdAt: string;
}

export interface ProcurementRecord {
  id: string;

  procurementReference: string;

  supplierName: string;

  supplierContact?: string;

  itemId: string;
  itemName: string;

  quantity: number;

  unitOfMeasure: string;

  unitCost?: number;
  totalCost?: number;
  currency?: string;

  warehouseId: string;
  warehouseName: string;

  purchaseOrderNumber?: string;

  batchNumber?: string;

  orderDate: string;
  receivedDate?: string;

  status:
    | "Ordered"
    | "Partially Received"
    | "Received"
    | "Cancelled";

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlert {
  id: string;

  severity: AlertSeverity;

  type:
    | "Low Stock"
    | "Critical Stock"
    | "Expired"
    | "Expiring Soon"
    | "Warehouse Capacity"
    | "Pending Request"
    | "Delayed Transfer"
    | "Stock Discrepancy"
    | "Other";

  title: string;

  message: string;

  itemId?: string;
  itemName?: string;

  warehouseId?: string;
  warehouseName?: string;

  reliefRequestId?: string;

  acknowledged: boolean;

  createdAt: string;
}

export interface StockDiscrepancy {
  id: string;

  referenceNumber: string;

  itemId: string;
  itemName: string;

  warehouseId: string;
  warehouseName: string;

  systemQuantity: number;
  physicalQuantity: number;

  variance: number;

  reason?: string;

  reportedBy: string;
  reviewedBy?: string;

  status:
    | "Open"
    | "Under Review"
    | "Approved"
    | "Rejected"
    | "Resolved";

  createdAt: string;
  resolvedAt?: string;
}

export interface InventoryAuditEntry {
  id: string;

  action:
    | "Create"
    | "Update"
    | "Delete"
    | "Stock In"
    | "Stock Out"
    | "Transfer"
    | "Reservation"
    | "Distribution"
    | "Adjustment"
    | "Export";

  entityType:
    | "Inventory"
    | "Warehouse"
    | "Movement"
    | "Request"
    | "Distribution"
    | "Donation"
    | "Procurement";

  entityId: string;

  description: string;

  performedBy: string;

  timestamp: string;

  ipAddress?: string;
}