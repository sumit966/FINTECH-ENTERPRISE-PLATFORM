// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Vendors, PurchaseOrders, Assets, Licenses seeder
// Idempotent.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { vendorsData } from '../database/data/vendors.data';
import { purchaseOrdersData } from '../database/data/procurement.data';
import { assetsData } from '../database/data/assets.data';
import { licensesData } from '../database/data/licenses.data';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Seeding vendors ...');

  for (const v of vendorsData) {
    await prisma.vendor.upsert({
      where: { vendorCode: v.vendorCode },
      update: {
        name: v.name,
        category: v.category,
        contactName: v.contactName,
        email: v.email,
        phone: v.phone,
        country: v.country,
        gstNumber: v.gstNumber,
        status: v.status,
        rating: v.rating,
      },
      create: {
        vendorCode: v.vendorCode,
        name: v.name,
        category: v.category,
        contactName: v.contactName,
        email: v.email,
        phone: v.phone,
        country: v.country,
        gstNumber: v.gstNumber,
        status: v.status,
        rating: v.rating,
      },
    });
  }
  console.log('  [OK] Vendors: ' + vendorsData.length);

  const allVendors = await prisma.vendor.findMany();
  const vendorIdByCode = new Map(allVendors.map((v) => [v.vendorCode, v.id]));

  console.log('>> Seeding purchase orders ...');
  let poCount = 0;
  for (const po of purchaseOrdersData) {
    const vendorId = vendorIdByCode.get(po.vendorCode);
    if (!vendorId) continue;
    await prisma.purchaseOrder.upsert({
      where: { poNumber: po.poNumber },
      update: {
        status: po.status,
        deliveredAt: po.deliveredAt,
      },
      create: {
        poNumber: po.poNumber,
        vendorId,
        title: po.title,
        description: po.description,
        amount: po.amount,
        currency: po.currency,
        issuedAt: po.issuedAt,
        deliveredAt: po.deliveredAt,
        status: po.status,
      },
    });
    poCount++;
  }
  console.log('  [OK] Purchase orders: ' + poCount);

  console.log('>> Seeding assets ...');
  const emps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(emps.map((e) => [e.employeeCode, e.id]));
  const locs = await prisma.location.findMany({ select: { id: true, code: true } });
  const locIdByCode = new Map(locs.map((l) => [l.code, l.id]));

  let assetCount = 0;
  let assetSkip = 0;
  for (const a of assetsData) {
    const assignedToId = a.assignedToCode ? empIdByCode.get(a.assignedToCode) || null : null;
    const locationId = locIdByCode.get(a.locationCode) || null;
    try {
      await prisma.asset.upsert({
        where: { assetCode: a.assetCode },
        update: {
          assignedToId,
          status: a.status,
        },
        create: {
          assetCode: a.assetCode,
          type: a.type,
          brand: a.brand,
          model: a.model,
          serialNumber: a.serialNumber,
          assignedToId,
          locationId,
          purchasedAt: a.purchasedAt,
          warrantyUntil: a.warrantyUntil,
          status: a.status,
          cost: a.cost,
        },
      });
      assetCount++;
    } catch (_e) { assetSkip++; }
  }
  console.log('  [OK] Assets: ' + assetCount + ' (skipped: ' + assetSkip + ')');

  console.log('>> Seeding licenses ...');
  let licCount = 0;
  for (const l of licensesData) {
    const vendorId = l.vendorCode ? vendorIdByCode.get(l.vendorCode) || null : null;
    await prisma.license.upsert({
      where: { licenseCode: l.licenseCode },
      update: {
        usedSeats: l.usedSeats,
        status: l.status,
        renewalAt: l.renewalAt,
      },
      create: {
        licenseCode: l.licenseCode,
        product: l.product,
        vendorId,
        seats: l.seats,
        usedSeats: l.usedSeats,
        costPerSeat: l.costPerSeat,
        currency: l.currency,
        purchasedAt: l.purchasedAt,
        renewalAt: l.renewalAt,
        status: l.status,
      },
    });
    licCount++;
  }
  console.log('  [OK] Licenses: ' + licCount);

  console.log('Vendors/Assets seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });