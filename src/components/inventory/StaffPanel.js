function StaffPanel({ staffForm, staffLogs, onStaffChange, onAddStaffLog }) {
  return (
    <>
      <div className="panel-card">
        <h3>Staff Work Tracker</h3>
        <div className="entry-form two-col">
          <input name="staffName" placeholder="Staff Name" value={staffForm.staffName} onChange={onStaffChange} />
          <input name="task" placeholder="Task" value={staffForm.task} onChange={onStaffChange} />
          <input name="itemName" placeholder="Item" value={staffForm.itemName} onChange={onStaffChange} />
          <input name="quantity" type="number" placeholder="Qty" value={staffForm.quantity} onChange={onStaffChange} />
          <select name="status" value={staffForm.status} onChange={onStaffChange}>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
          <button className="full-span" onClick={onAddStaffLog}>Add Staff Log</button>
        </div>
      </div>

      <div className="panel-card mt-lg">
        <h3>Staff Activity List</h3>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Task</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staffLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="loading-text">No staff logs yet.</td>
              </tr>
            ) : (
              staffLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.staffName}</td>
                  <td>{log.task}</td>
                  <td>{log.itemName}</td>
                  <td>{log.quantity}</td>
                  <td>
                    <span className={`status-badge ${log.status === "Completed" ? "ok" : "pending"}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default StaffPanel;
