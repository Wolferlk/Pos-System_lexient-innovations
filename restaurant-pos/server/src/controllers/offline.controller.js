const {
  queueLocalOrder,
  getPendingLocalOrders,
  syncPendingOrdersToCloud,
} = require("../services/localSync.service");
const { isCloudConnected } = require("../config/cloudState");
const { logAction } = require("../utils/auditLogger");

exports.queueOrder = async (req, res) => {
  try {
    const payload = req.body || {};
    const queued = await queueLocalOrder(payload);

    await logAction({
      req,
      action: "QUEUE_OFFLINE_ORDER",
      task: "Queue offline order",
      module: "OfflineSync",
      description: `Order ${queued.invoiceNumber} queued locally`,
      entityType: "LocalOrder",
      entityId: queued.id,
    });

    res.status(201).json({
      message: "Order queued locally",
      queued,
      cloudConnected: isCloudConnected(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingOrders = async (_req, res) => {
  try {
    const rows = await getPendingLocalOrders();
    res.json({
      pending: rows.length,
      rows,
      cloudConnected: isCloudConnected(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.syncPending = async (req, res) => {
  try {
    const result = await syncPendingOrdersToCloud(req.user?.id);

    await logAction({
      req,
      action: "SYNC_OFFLINE_ORDERS",
      task: "Sync offline orders",
      module: "OfflineSync",
      description: `Synced ${result.synced}, skipped ${result.skipped}, pending ${result.pending}`,
      payload: result,
    });

    res.json(result);
  } catch (error) {
    await logAction({
      req,
      action: "SYNC_OFFLINE_ORDERS",
      task: "Sync offline orders",
      module: "OfflineSync",
      status: "FAILED",
      description: "Offline sync failed",
      payload: { message: error.message },
    });
    res.status(500).json({ message: error.message });
  }
};

exports.status = async (_req, res) => {
  try {
    const rows = await getPendingLocalOrders();
    res.json({
      cloudConnected: isCloudConnected(),
      pendingOrders: rows.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
