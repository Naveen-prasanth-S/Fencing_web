import { useEffect, useState } from "react";
import "../inventory/InventoryPages.css";

function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("stockOrders");
      setOrders(raw ? JSON.parse(raw) : []);
    } catch {
      setOrders([]);
    }
  }, []);

  const markDelivered = (id) => {
    const updated = orders.map((order) =>
      order.id === id && order.status !== "Delivered"
        ? { ...order, status: "Delivered", deliveredAt: new Date().toLocaleString() }
        : order
    );
    setOrders(updated);
    sessionStorage.setItem("stockOrders", JSON.stringify(updated));
  };

  return (
    <div className="stock-dash-page">
      <div className="panel-card">
        <h3>Staff Order Tracking</h3>
        <p className="page-note">View assigned orders and update delivery status.</p>

        <table className="mini-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Staff</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="loading-text">No orders available.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.itemName}</td>
                  <td>{order.quantity}</td>
                  <td>{order.staffName}</td>
                  <td>
                    <span className={`status-badge ${order.status === "Delivered" ? "ok" : "pending"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="small-action"
                      onClick={() => markDelivered(order.id)}
                      disabled={order.status === "Delivered"}
                    >
                      Mark Delivered
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffOrdersPage;
