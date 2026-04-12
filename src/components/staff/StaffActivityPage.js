import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "../inventory/InventoryPages.css";

function StaffActivityPage() {
  const {
    authUser,
    loading,
    activityForm,
    myStaffLogs,
    staffMetrics,
    handleActivityChange,
    handleAddActivity,
    handleUpdateActivityStatus,
  } = useOutletContext();
  const [draftStatuses, setDraftStatuses] = useState({});

  const onDraftStatusChange = (id, value) => {
    setDraftStatuses((prev) => ({ ...prev, [id]: value }));
  };

  const getDraftStatus = (log) => draftStatuses[log.id] || log.status;

  return (
    <div className="stock-dash-page">
      <div className="panel-card">
        <h3>Task Status Updates</h3>
        <p className="page-note">
          Add your work progress and keep your task status updated.
        </p>

        <div className="kpi-grid mb-3">
          <div className="kpi-card">
            <span>Total Logs</span>
            <strong>{myStaffLogs.length}</strong>
          </div>
          <div className="kpi-card warning">
            <span>In Progress</span>
            <strong>{staffMetrics.inProgressTasks}</strong>
          </div>
          <div className="kpi-card success">
            <span>Completed</span>
            <strong>{staffMetrics.completedTasks}</strong>
          </div>
        </div>

        <div className="panel-card mt-lg">
          <h3>Add Task Update</h3>
          <p className="page-note">
            Log will be saved under <strong>{authUser?.name || "Staff"}</strong>.
          </p>
          <div className="entry-form two-col">
            <input
              name="task"
              placeholder="Task"
              value={activityForm.task}
              onChange={handleActivityChange}
            />
            <input
              name="itemName"
              placeholder="Item"
              value={activityForm.itemName}
              onChange={handleActivityChange}
            />
            <input
              name="quantity"
              type="number"
              placeholder="Qty"
              value={activityForm.quantity}
              onChange={handleActivityChange}
            />
            <select
              name="status"
              value={activityForm.status}
              onChange={handleActivityChange}
            >
              <option>In Progress</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
            <button className="full-span" onClick={handleAddActivity}>
              Add Task Update
            </button>
          </div>
        </div>

        <div className="panel-card mt-lg">
          <h3>Task Update History</h3>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="loading-text">Loading activity logs...</td>
                </tr>
              ) : myStaffLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="loading-text">
                    No activity logs added yet.
                  </td>
                </tr>
              ) : (
                myStaffLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.task}</td>
                    <td>{log.itemName}</td>
                    <td>{log.quantity}</td>
                    <td>
                      <select
                        value={getDraftStatus(log)}
                        onChange={(event) =>
                          onDraftStatusChange(log.id, event.target.value)
                        }
                      >
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Pending</option>
                      </select>
                    </td>
                    <td>
                      {log.updatedAt
                        ? new Date(log.updatedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="small-action"
                        onClick={() =>
                          handleUpdateActivityStatus(log.id, getDraftStatus(log))
                        }
                      >
                        Save Status
                      </button>
                    </td>
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

export default StaffActivityPage;
