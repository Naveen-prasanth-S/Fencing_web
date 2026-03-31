import { useEffect, useState } from "react";
import "../inventory/InventoryPages.css";
import { getInventory } from "../../services/inventoryApi";

function StaffStockListPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await getInventory();
        setItems(data);
      } catch (error) {
        alert(error.message || "Failed to load stock details.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="stock-dash-page">
      <div className="panel-card">
        <h3>Staff Stock List</h3>
        <p className="page-note">View available stock and low stock alerts.</p>

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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="loading-text">No stock available.</td>
                </tr>
              ) : (
                items.map((item) => {
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
