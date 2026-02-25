const { all, run } = require("../../localdb/database");
const Order = require("../models/Order");
const { isCloudConnected } = require("../config/cloudState");

const queueLocalOrder = async (payload) => {
  const invoice = payload.invoiceNumber || `OFF-${Date.now()}`;
  const row = await run(
    `INSERT INTO local_orders (invoiceNumber, payload, isSynced) VALUES (?, ?, 0)`,
    [invoice, JSON.stringify(payload)]
  );
  return { id: row.lastID, invoiceNumber: invoice };
};

const getPendingLocalOrders = async () => {
  const rows = await all(
    `SELECT id, invoiceNumber, payload, createdAt FROM local_orders WHERE isSynced = 0 ORDER BY createdAt ASC`
  );
  return rows.map((r) => ({
    ...r,
    payload: JSON.parse(r.payload),
  }));
};

const markSynced = async (id) => {
  await run(
    `UPDATE local_orders SET isSynced = 1, syncedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [id]
  );
};

const mapPayloadToCloudOrder = (payload, userId) => ({
  invoiceNumber: payload.invoiceNumber || `SYNC-${Date.now()}`,
  items: payload.items || [],
  subTotal: payload.subTotal || 0,
  totalDiscount: payload.totalDiscount || 0,
  grandTotal:
    payload.grandTotal ??
    (Number(payload.subTotal || 0) - Number(payload.totalDiscount || 0)),
  paymentMethod: payload.paymentMethod || "Cash",
  customerPhone: payload.customerPhone || null,
  createdBy: userId || null,
  isSynced: true,
  status: payload.status || "Completed",
});

const syncPendingOrdersToCloud = async (userId) => {
  if (!isCloudConnected()) {
    return { synced: 0, skipped: 0, pending: 0, cloudConnected: false };
  }

  const pending = await getPendingLocalOrders();
  let synced = 0;
  let skipped = 0;

  for (const localRow of pending) {
    const invoiceNumber = localRow.payload?.invoiceNumber || localRow.invoiceNumber;
    const existing = await Order.findOne({ invoiceNumber });
    if (existing) {
      await markSynced(localRow.id);
      skipped += 1;
      continue;
    }

    const doc = mapPayloadToCloudOrder(localRow.payload, userId);
    await Order.create(doc);
    await markSynced(localRow.id);
    synced += 1;
  }

  const stillPendingRows = await all(
    `SELECT COUNT(*) AS c FROM local_orders WHERE isSynced = 0`
  );

  return {
    synced,
    skipped,
    pending: Number(stillPendingRows?.[0]?.c || 0),
    cloudConnected: true,
  };
};

module.exports = {
  queueLocalOrder,
  getPendingLocalOrders,
  syncPendingOrdersToCloud,
};
