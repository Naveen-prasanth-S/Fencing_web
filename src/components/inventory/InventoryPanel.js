function InventoryPanel({
  form,
  loading,
  items,
  onChange,
  onAdd,
  onDelete,
  onUpdateQuantity,
}) {
  return (
    <>
      <div className="panel-card">
        <h3>Stock Entry</h3>
        <div className="entry-form">
          <input name="itemName" placeholder="Item Name" value={form.itemName} onChange={onChange} />
          <input name="category" placeholder="Category" value={form.category} onChange={onChange} />
          <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={onChange} />
          <input name="minLevel" type="number" placeholder="Min Level" value={form.minLevel} onChange={onChange} />
          <button onClick={onAdd}>Add Item</button>
        </div>
      </div>

      <div className="panel-card mt-lg">
        <h3>Current Inventory List</h3>
        {loading ? (
          <p className="loading-text">Loading inventory...</p>
        ) : (
          <table className="mini-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Min</th>
                <th>Status</th>
                <th>Adjust</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="loading-text">No inventory items yet.</td>
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
                      <td>
                        <div className="adjust-controls">
                          <button onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                          <button onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => onDelete(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default InventoryPanel;
