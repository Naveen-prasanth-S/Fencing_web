function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function InventoryOverview({
  items,
  totals,
  forecast = [],
  forecastModel,
  forecastSummary,
  forecastLoading,
}) {
  const lowStockItems = items.filter((x) => x.quantity <= x.minLevel);
  const highlightedForecast = forecast
    .filter((item) => item.urgency !== "Low" || item.recommendedReorderQty > 0)
    .slice(0, 6);

  return (
    <div className="panel-card">
      <h3>Inventory Snapshot</h3>
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Total Items</span>
          <strong>{totals.totalItems}</strong>
        </div>
        <div className="kpi-card">
          <span>Total Units</span>
          <strong>{totals.totalUnits}</strong>
        </div>
        <div className="kpi-card warning">
          <span>Low Stock</span>
          <strong>{totals.lowStock}</strong>
        </div>
        <div className="kpi-card danger">
          <span>Out of Stock</span>
          <strong>{totals.outOfStock}</strong>
        </div>
        <div className="kpi-card">
          <span>Ordered Units</span>
          <strong>{totals.orderedUnits}</strong>
        </div>
        <div className="kpi-card success">
          <span>Delivered Units</span>
          <strong>{totals.deliveredUnits}</strong>
        </div>
      </div>

      <section className="ml-forecast-panel mt-lg">
        <div className="ml-forecast-head">
          <div>
            <h4 className="sub-title forecast-title">Smart Reorder Forecast</h4>
          </div>
          <span className="forecast-badge">
            {forecastModel?.horizonDays || 7}-Day Forecast
          </span>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span>Tracked Items</span>
            <strong>{forecastSummary?.trackedItems ?? forecast.length}</strong>
          </div>
          <div className="kpi-card warning">
            <span>Urgent Reorders</span>
            <strong>{forecastSummary?.urgentItems ?? 0}</strong>
          </div>
          <div className="kpi-card danger">
            <span>Items To Reorder</span>
            <strong>{forecastSummary?.reorderItems ?? 0}</strong>
          </div>
          <div className="kpi-card success">
            <span>Model Confidence</span>
            <strong>{forecastSummary?.averageConfidence ?? 0}%</strong>
          </div>
          <div className="kpi-card">
            <span>Total Reorder Qty</span>
            <strong>{formatNumber(forecastSummary?.totalReorderQty ?? 0)}</strong>
          </div>
          <div className="kpi-card">
            <span>Model Version</span>
            <strong>{forecastModel?.version || "1.0.0"}</strong>
          </div>
        </div>

        <table className="mini-table mt-lg">
          <thead>
            <tr>
              <th>Item</th>
              <th>Current</th>
              <th>7-Day Demand</th>
              <th>Reorder Qty</th>
              <th>Days Until Low</th>
              <th>Urgency</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {forecastLoading ? (
              <tr>
                <td colSpan={7} className="loading-text">
                  Generating smart reorder forecast...
                </td>
              </tr>
            ) : highlightedForecast.length === 0 ? (
              <tr>
                <td colSpan={7} className="loading-text">
                  Not enough recent demand signals yet. Add orders and staff
                  activity to improve predictions.
                </td>
              </tr>
            ) : (
              highlightedForecast.map((item) => (
                <tr key={item.itemId || item.itemName}>
                  <td>
                    <strong>{item.itemName}</strong>
                    <div className="table-meta">{item.category}</div>
                  </td>
                  <td>
                    {formatNumber(item.currentStock)}
                    <div className="table-meta">
                      Min: {formatNumber(item.minLevel)}
                    </div>
                  </td>
                  <td>{formatNumber(item.predictedDemandNext7Days)}</td>
                  <td>{formatNumber(item.recommendedReorderQty)}</td>
                  <td>
                    {item.daysUntilLowStock === null
                      ? "--"
                      : `${item.daysUntilLowStock} days`}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        item.urgency === "High"
                          ? "low"
                          : item.urgency === "Medium"
                            ? "pending"
                            : "ok"
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </td>
                  <td>{item.confidence}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <h4 className="sub-title">Low Stock Items</h4>
      <table className="mini-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Min</th>
          </tr>
        </thead>
        <tbody>
          {lowStockItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="loading-text">No low stock items.</td>
            </tr>
          ) : (
            lowStockItems.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.minLevel}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryOverview;
