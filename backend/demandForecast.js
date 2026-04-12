const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LOOKBACK_DAYS = 30;
const DEFAULT_HORIZON_DAYS = 7;

function normalizeItemName(value) {
  return String(value || "").trim().toLowerCase();
}

function getUtcDayValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
}

function createDailySeries(length) {
  return Array.from({ length }, () => 0);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function computeTrendSlope(values) {
  if (values.length < 2) return 0;

  const xMean = (values.length - 1) / 2;
  const yMean = average(values);

  let numerator = 0;
  let denominator = 0;

  values.forEach((value, index) => {
    const xDiff = index - xMean;
    numerator += xDiff * (value - yMean);
    denominator += xDiff * xDiff;
  });

  if (denominator === 0) return 0;
  return numerator / denominator;
}

function getBucketIndex(dateValue, seriesStartDay, lookbackDays) {
  const utcDay = getUtcDayValue(dateValue);
  if (utcDay === null) return -1;

  const diff = Math.floor((utcDay - seriesStartDay) / MS_PER_DAY);
  if (diff < 0 || diff >= lookbackDays) return -1;
  return diff;
}

function getOrCreate(map, key, createValue) {
  if (!map.has(key)) {
    map.set(key, createValue());
  }

  return map.get(key);
}

function getLatestDateValue(currentValue, nextValue) {
  const currentTime = currentValue ? new Date(currentValue).getTime() : NaN;
  const nextTime = nextValue ? new Date(nextValue).getTime() : NaN;

  if (Number.isNaN(nextTime)) return currentValue || null;
  if (Number.isNaN(currentTime)) return nextValue;
  return nextTime > currentTime ? nextValue : currentValue;
}

function buildForecast({
  items = [],
  orders = [],
  staffLogs = [],
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
  horizonDays = DEFAULT_HORIZON_DAYS,
} = {}) {
  const today = getUtcDayValue(new Date());
  const seriesStartDay = today - (lookbackDays - 1) * MS_PER_DAY;
  const signalsByItem = new Map();
  const inventoryByItem = new Map();

  items.forEach((item) => {
    const key = normalizeItemName(item.itemName);
    if (!key) return;

    inventoryByItem.set(key, item);
    getOrCreate(signalsByItem, key, () => ({
      displayName: item.itemName,
      deliveredSeries: createDailySeries(lookbackDays),
      taskSeries: createDailySeries(lookbackDays),
      pendingOrderQty: 0,
      inProgressQty: 0,
      lastActivityAt: null,
    }));
  });

  orders.forEach((order) => {
    const key = normalizeItemName(order.itemName);
    if (!key) return;

    const bucket = getOrCreate(signalsByItem, key, () => ({
      displayName: order.itemName,
      deliveredSeries: createDailySeries(lookbackDays),
      taskSeries: createDailySeries(lookbackDays),
      pendingOrderQty: 0,
      inProgressQty: 0,
      lastActivityAt: null,
    }));
    bucket.displayName = bucket.displayName || order.itemName;

    const quantity = Math.max(0, Number(order.quantity) || 0);
    const signalDate = order.deliveredAt || order.updatedAt || order.createdAt;

    if (order.status === "Delivered") {
      const index = getBucketIndex(signalDate, seriesStartDay, lookbackDays);
      if (index >= 0) {
        bucket.deliveredSeries[index] += quantity;
      }
    } else {
      bucket.pendingOrderQty += quantity;
    }

    bucket.lastActivityAt = getLatestDateValue(bucket.lastActivityAt, signalDate);
  });

  staffLogs.forEach((log) => {
    const key = normalizeItemName(log.itemName);
    if (!key) return;

    const bucket = getOrCreate(signalsByItem, key, () => ({
      displayName: log.itemName,
      deliveredSeries: createDailySeries(lookbackDays),
      taskSeries: createDailySeries(lookbackDays),
      pendingOrderQty: 0,
      inProgressQty: 0,
      lastActivityAt: null,
    }));
    bucket.displayName = bucket.displayName || log.itemName;

    const quantity = Math.max(0, Number(log.quantity) || 0);
    const signalDate = log.updatedAt || log.createdAt;

    let weight = 0;
    if (log.status === "Completed") {
      weight = 0.45;
    } else if (log.status === "In Progress") {
      weight = 0.2;
      bucket.inProgressQty += quantity;
    } else if (log.status === "Pending") {
      weight = 0.1;
    }

    const index = getBucketIndex(signalDate, seriesStartDay, lookbackDays);
    if (index >= 0 && weight > 0) {
      bucket.taskSeries[index] += quantity * weight;
    }

    bucket.lastActivityAt = getLatestDateValue(bucket.lastActivityAt, signalDate);
  });

  const predictions = Array.from(signalsByItem.entries())
    .map(([key, signals]) => {
      const item = inventoryByItem.get(key);
      const currentStock = Math.max(0, Number(item?.quantity) || 0);
      const minLevel = Math.max(0, Number(item?.minLevel) || 0);
      const deliveredSeries = signals.deliveredSeries;
      const taskSeries = signals.taskSeries;
      const combinedSeries = deliveredSeries.map(
        (value, index) => value + taskSeries[index]
      );

      const last7 = combinedSeries.slice(-7);
      const last14 = combinedSeries.slice(-14);
      const dailyAverage7 = average(last7);
      const dailyAverage14 = average(last14);
      const dailyAverage30 = average(combinedSeries);
      const trendSlope = computeTrendSlope(last14);
      const weightedDailyDemand =
        dailyAverage7 * 0.55 + dailyAverage14 * 0.3 + dailyAverage30 * 0.15;
      const trendAdjustedDailyDemand = Math.max(
        0,
        weightedDailyDemand + clamp(trendSlope * 4, -weightedDailyDemand * 0.4, weightedDailyDemand * 0.75)
      );
      const projectedUsageDays = trendAdjustedDailyDemand * horizonDays;
      const pendingDemandBoost =
        signals.pendingOrderQty * 0.6 + signals.inProgressQty * 0.35;
      const forecastDemand = Math.max(
        0,
        Math.round((projectedUsageDays + pendingDemandBoost) * 100) / 100
      );
      const reorderQuantity = Math.max(
        0,
        Math.ceil(minLevel + forecastDemand - currentStock)
      );
      const coverageDays =
        trendAdjustedDailyDemand > 0
          ? Math.floor(currentStock / trendAdjustedDailyDemand)
          : null;
      const daysUntilLowStock =
        trendAdjustedDailyDemand > 0
          ? Math.max(
              0,
              Math.floor((currentStock - minLevel) / trendAdjustedDailyDemand)
            )
          : null;
      const nonZeroDays = combinedSeries.filter((value) => value > 0).length;
      const historyDemand = sum(combinedSeries);
      const confidence = Math.round(
        clamp(
          nonZeroDays * 3.5 +
            Math.min(historyDemand, 120) * 0.3 +
            (signals.pendingOrderQty > 0 ? 8 : 0),
          15,
          96
        )
      );

      let urgency = "Low";
      if (
        currentStock <= minLevel ||
        reorderQuantity > 0 ||
        (daysUntilLowStock !== null && daysUntilLowStock <= horizonDays)
      ) {
        urgency = "Medium";
      }
      if (
        currentStock <= minLevel ||
        reorderQuantity >= Math.max(5, minLevel) ||
        (daysUntilLowStock !== null && daysUntilLowStock <= 3)
      ) {
        urgency = "High";
      }

      return {
        itemId: item?._id ? String(item._id) : null,
        itemName: item?.itemName || signals.displayName || key,
        category: item?.category || "General",
        currentStock,
        minLevel,
        pendingOrders: Math.round(signals.pendingOrderQty * 100) / 100,
        inProgressTasks: Math.round(signals.inProgressQty * 100) / 100,
        predictedDailyDemand:
          Math.round(trendAdjustedDailyDemand * 100) / 100,
        predictedDemandNext7Days: forecastDemand,
        recommendedReorderQty: reorderQuantity,
        stockCoverageDays: coverageDays,
        daysUntilLowStock,
        confidence,
        urgency,
        lastActivityAt: signals.lastActivityAt,
      };
    })
    .sort((left, right) => {
      const urgencyRank = { High: 0, Medium: 1, Low: 2 };
      const leftRank = urgencyRank[left.urgency] ?? 3;
      const rightRank = urgencyRank[right.urgency] ?? 3;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      if (right.recommendedReorderQty !== left.recommendedReorderQty) {
        return right.recommendedReorderQty - left.recommendedReorderQty;
      }

      return right.predictedDemandNext7Days - left.predictedDemandNext7Days;
    });

  const urgentItems = predictions.filter((item) => item.urgency === "High").length;
  const reorderItems = predictions.filter(
    (item) => item.recommendedReorderQty > 0
  ).length;
  const totalReorderQty = predictions.reduce(
    (total, item) => total + item.recommendedReorderQty,
    0
  );
  const averageConfidence = predictions.length
    ? Math.round(
        predictions.reduce((total, item) => total + item.confidence, 0) /
          predictions.length
      )
    : 0;

  return {
    model: {
      name: "Demand Trend Forecaster",
      version: "1.0.0",
      lookbackDays,
      horizonDays,
      generatedAt: new Date().toISOString(),
      notes:
        "Forecast uses delivered orders, staff task activity, recent averages, and a trend slope to recommend reorder quantity.",
    },
    summary: {
      trackedItems: predictions.length,
      urgentItems,
      reorderItems,
      totalReorderQty,
      averageConfidence,
    },
    predictions,
  };
}

module.exports = {
  buildForecast,
};
