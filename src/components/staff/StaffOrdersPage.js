import { useOutletContext } from "react-router-dom";
import "../inventory/InventoryPages.css";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function StaffOrdersPage() {
  const { loading, myOrders, staffMetrics, handleMarkDelivered } =
    useOutletContext();

  return (
    <div className="stock-dash-page">
      <div className="panel-card">
        <h3>Work Order Assignment</h3>
        <p className="page-note">
          View work orders assigned to you and update delivery status.
        </p>

        <div className="kpi-grid mb-3">
          <div className="kpi-card">
            <span>Assigned Orders</span>
            <strong>{staffMetrics.assignedOrders}</strong>
          </div>
          <div className="kpi-card warning">
            <span>Pending</span>
            <strong>{staffMetrics.pendingOrders}</strong>
          </div>
          <div className="kpi-card success">
            <span>Delivered</span>
            <strong>{staffMetrics.deliveredOrders}</strong>
          </div>
        </div>

        <table className="mini-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Created</th>
              <th>Delivered</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="loading-text">Loading work orders...</td>
              </tr>
            ) : myOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="loading-text">
                  No work orders assigned to you yet.
                </td>
              </tr>
            ) : (
              myOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.itemName}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        order.status === "Delivered" ? "ok" : "pending"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatDate(order.deliveredAt)}</td>
                  <td>
                    <button
                      className="small-action"
                      onClick={() => handleMarkDelivered(order.id)}
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
