import { prisma } from '../config/prisma';

export async function listDevices() {
  const rows = await prisma.biometricDevice.findMany({ orderBy: { deviceCode: 'asc' } });
  return rows.map((d) => ({
    id: d.id, deviceCode: d.deviceCode, name: d.name, vendor: d.vendor, model: d.model,
    locationCode: d.locationCode, ipAddress: d.ipAddress, integrationType: d.integrationType,
    status: d.status, lastSyncAt: d.lastSyncAt, notes: d.notes,
  }));
}

export async function createDevice(input: any, actorUserId: string | null) {
  const created = await prisma.biometricDevice.create({
    data: {
      deviceCode: input.deviceCode,
      name: input.name,
      vendor: input.vendor,
      model: input.model,
      locationCode: input.locationCode,
      ipAddress: input.ipAddress || null,
      integrationType: input.integrationType || 'NONE',
      status: 'INTEGRATION_REQUIRED',
      notes: input.notes || null,
    },
  });
  await prisma.auditLog.create({
    data: { userId: actorUserId, action: 'CREATE', module: 'biometric', recordId: created.id, newValue: { deviceCode: created.deviceCode } as any },
  });
  return { id: created.id, deviceCode: created.deviceCode, name: created.name, status: created.status };
}

export async function getSummary() {
  const rows = await prisma.biometricDevice.findMany();
  return {
    total: rows.length,
    connected: rows.filter((r) => r.status === 'CONNECTED').length,
    integrationRequired: rows.filter((r) => r.status === 'INTEGRATION_REQUIRED').length,
    error: rows.filter((r) => r.status === 'ERROR').length,
  };
}