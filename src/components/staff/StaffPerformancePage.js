import { useOutletContext } from "react-router-dom";
import "../inventory/InventoryPages.css";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function StaffPerformancePage() {
  const { loading, myOrders, myStaffLogs, staffMetrics } = useOutletContext();

  const recentLogs = myStaffLogs.slice(0, 5);

  return (
    <div className="stock-dash-page">
      <div className="panel-card">
        <h3>Performance Tracking</h3>
        <p className="page-note">
          Review your work order completion and task progress in one place.
        </p>

        <div className="kpi-grid mb-3">
          <div className="kpi-card">
            <span>Delivery Rate</span>
            <strong>{staffMetrics.deliveryRate}%</strong>
          </div>
          <div className="kpi-card success">
            <span>Task Completion Rate</span>
            <strong>{staffMetrics.taskCompletionRate}%</strong>
          </div>
          <div className="kpi-card warning">
            <span>Pending Tasks</span>
            <strong>{staffMetrics.pendingTasks}</strong>
          </div>
          <div className="kpi-card">
            <span>Completed Tasks</span>
            <strong>{staffMetrics.completedTasks}</strong>
          </div>
        </div>

        <div className="panel-card mt-lg">
          <h3>Work Order Summary</h3>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Total Orders</th>
                <th>Pending</th>
                <th>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="loading-text">Loading performance data...</td>
                </tr>
              ) : (
                <tr>
                  <td>{myOrders.length}</td>
                  <td>{staffMetrics.pendingOrders}</td>
                  <td>{staffMetrics.deliveredOrders}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-card mt-lg">
          <h3>Recent Task Updates</h3>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Item</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="loading-text">Loading task updates...</td>
                </tr>
              ) : recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="loading-text">No task updates available.</td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.task}</td>
                    <td>{log.itemName}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          log.status === "Completed" ? "ok" : "pending"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td>{formatDate(log.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StaffPerformancePage;
