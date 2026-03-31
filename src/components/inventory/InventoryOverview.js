function InventoryOverview({ items, totals }) {
  const lowStockItems = items.filter((x) => x.quantity <= x.minLevel);

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
