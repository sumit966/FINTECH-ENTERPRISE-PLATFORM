// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Assets (deterministic)
// ~750 assets (laptops, monitors, phones, servers).
// ============================================================================

import { employeesData } from './employees.data';

export type AssetType = 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'MOBILE' | 'ACCESSORY' | 'SERVER';
export type AssetStatus = 'IN_USE' | 'IN_STOCK' | 'REPAIR' | 'RETIRED';

export interface AssetData {
  assetCode: string;
  type: AssetType;
  brand: string;
  model: string;
  serialNumber: string;
  assignedToCode: string | null;
  locationCode: string;
  purchasedAt: Date;
  warrantyUntil: Date;
  status: AssetStatus;
  cost: number;
}

const BRANDS_BY_TYPE: Record<AssetType, { brand: string; model: string; cost: number }[]> = {
  LAPTOP:   [
    { brand: 'Dell',   model: 'Latitude 5440',    cost: 85000 },
    { brand: 'HP',     model: 'ProBook 450 G10',  cost: 78000 },
    { brand: 'Lenovo', model: 'ThinkPad T14 G4',  cost: 92000 },
    { brand: 'Apple',  model: 'MacBook Pro 14 M3',cost: 185000 },
  ],
  DESKTOP:  [
    { brand: 'Dell',   model: 'OptiPlex 7010',    cost: 65000 },
    { brand: 'HP',     model: 'ProDesk 400 G9',   cost: 58000 },
  ],
  MONITOR:  [
    { brand: 'Dell',   model: 'P2723D 27-inch',   cost: 22000 },
    { brand: 'LG',     model: '27UP850 27-inch',  cost: 32000 },
    { brand: 'BenQ',   model: 'PD2705U 27-inch',  cost: 38000 },
  ],
  MOBILE:   [
    { brand: 'Samsung', model: 'Galaxy S24',      cost: 80000 },
    { brand: 'Apple',   model: 'iPhone 15',       cost: 79000 },
    { brand: 'Google',  model: 'Pixel 8',         cost: 75000 },
  ],
  ACCESSORY: [
    { brand: 'Logitech', model: 'MX Master 3S',   cost: 8500 },
    { brand: 'Jabra',    model: 'Evolve2 65',     cost: 15500 },
  ],
  SERVER:   [
    { brand: 'Dell',   model: 'PowerEdge R750',   cost: 850000 },
    { brand: 'HPE',    model: 'ProLiant DL380',   cost: 780000 },
  ],
};

const ALL_TYPES: AssetType[] = ['LAPTOP', 'LAPTOP', 'LAPTOP', 'MONITOR', 'MONITOR', 'ACCESSORY', 'MOBILE', 'SERVER'];

function pickBrand(type: AssetType, seed: number) {
  const options = BRANDS_BY_TYPE[type];
  return options[seed % options.length];
}

export const assetsData: AssetData[] = [];

// 1 laptop per employee = 500
for (let i = 0; i < employeesData.length; i++) {
  const emp = employeesData[i];
  const { brand, model, cost } = pickBrand('LAPTOP', i);
  const purchasedAt = new Date(Date.UTC(2023, i % 12, 1 + (i % 28)));
  const warrantyUntil = new Date(Date.UTC(2026, i % 12, 1 + (i % 28)));
  assetsData.push({
    assetCode: 'AST-L-' + String(i + 1).padStart(4, '0'),
    type: 'LAPTOP',
    brand,
    model,
    serialNumber: 'SN-L-' + String(100000 + i).padStart(6, '0'),
    assignedToCode: emp.employeeCode,
    locationCode: emp.locationCode,
    purchasedAt,
    warrantyUntil,
    status: 'IN_USE',
    cost,
  });
}

// 1 monitor per employee for engineers (every 2nd employee) = 250
let monitorCount = 0;
for (let i = 0; i < employeesData.length; i += 2) {
  const emp = employeesData[i];
  const { brand, model, cost } = pickBrand('MONITOR', i);
  const purchasedAt = new Date(Date.UTC(2023, i % 12, 1 + (i % 28)));
  const warrantyUntil = new Date(Date.UTC(2026, i % 12, 1 + (i % 28)));
  assetsData.push({
    assetCode: 'AST-M-' + String(monitorCount + 1).padStart(4, '0'),
    type: 'MONITOR',
    brand,
    model,
    serialNumber: 'SN-M-' + String(200000 + monitorCount).padStart(6, '0'),
    assignedToCode: emp.employeeCode,
    locationCode: emp.locationCode,
    purchasedAt,
    warrantyUntil,
    status: 'IN_USE',
    cost,
  });
  monitorCount++;
}

// Accessories for team leads and above (every 5th employee) = 100
let accCount = 0;
for (let i = 0; i < employeesData.length; i += 5) {
  const emp = employeesData[i];
  const { brand, model, cost } = pickBrand('ACCESSORY', i);
  const purchasedAt = new Date(Date.UTC(2024, i % 12, 1 + (i % 28)));
  const warrantyUntil = new Date(Date.UTC(2027, i % 12, 1 + (i % 28)));
  assetsData.push({
    assetCode: 'AST-A-' + String(accCount + 1).padStart(4, '0'),
    type: 'ACCESSORY',
    brand,
    model,
    serialNumber: 'SN-A-' + String(300000 + accCount).padStart(6, '0'),
    assignedToCode: emp.employeeCode,
    locationCode: emp.locationCode,
    purchasedAt,
    warrantyUntil,
    status: 'IN_USE',
    cost,
  });
  accCount++;
}

// Server fleet = 20
for (let i = 0; i < 20; i++) {
  const { brand, model, cost } = pickBrand('SERVER', i);
  const locationCode = ['PUNE', 'BLR', 'NOIDA'][i % 3];
  assetsData.push({
    assetCode: 'AST-S-' + String(i + 1).padStart(4, '0'),
    type: 'SERVER',
    brand,
    model,
    serialNumber: 'SN-S-' + String(400000 + i).padStart(6, '0'),
    assignedToCode: null,
    locationCode,
    purchasedAt: new Date(Date.UTC(2023, i % 12, 1)),
    warrantyUntil: new Date(Date.UTC(2028, i % 12, 1)),
    status: 'IN_USE',
    cost,
  });
}

console.log('Generated ' + assetsData.length + ' assets');