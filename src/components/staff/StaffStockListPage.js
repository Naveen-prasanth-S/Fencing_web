import { useOutletContext } from "react-router-dom";
import "../inventory/InventoryPages.css";

function StaffStockListPage() {
  const { loading, inventoryItems, staffMetrics } = useOutletContext();

  return (
    <div className="stock-dash-page">
      <div className="panel-card">
        <h3>Staff Stock List</h3>
        <p className="page-note">View available stock and low stock alerts.</p>

        <div className="kpi-grid mb-3">
          <div className="kpi-card">
            <span>Total Items</span>
            <strong>{inventoryItems.length}</strong>
          </div>
          <div className="kpi-card warning">
            <span>Low Stock Alerts</span>
            <strong>{staffMetrics.lowStock}</strong>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading inventory...</p>
        ) : (
          <table className="mini-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Min Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="loading-text">No stock available.</td>
                </tr>
              ) : (
                inventoryItems.map((item) => {
                  const isLow = item.quantity <= item.minLevel;
                  return (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.minLevel}</td>
                      <td>
                        <span className={`status-badge ${isLow ? "low" : "ok"}`}>
                          {isLow ? "Low" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StaffStockListPage;
