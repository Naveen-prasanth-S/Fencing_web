import { useState } from "react";
import { useOutletContext } from "react-router-dom";

function StockListPage() {
  const {
    loading,
    items,
    form,
    handleFormChange,
    handleAddInventoryItem,
    handleDeleteInventoryItem,
    handleUpdateInventoryItem,
  } = useOutletContext();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    category: "",
    quantity: "",
    minLevel: "",
  });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      itemName: item.itemName,
      category: item.category,
      quantity: String(item.quantity),
      minLevel: String(item.minLevel),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ itemName: "", category: "", quantity: "", minLevel: "" });
  };

  const saveEdit = async (id) => {
    const ok = await handleUpdateInventoryItem(id, editForm);
    if (ok) cancelEdit();
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  return (
    <div className="panel-card">
      <h3>Stock Details & CRUD Operations</h3>
      <p className="page-note">
        Create, view, update, and delete stock records from this page.
      </p>

      <div className="entry-form mb-3">
        <input
          name="itemName"
          placeholder="Item Name"
          value={form.itemName}
          onChange={handleFormChange}
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleFormChange}
        />
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleFormChange}
        />
        <input
          name="minLevel"
          type="number"
          placeholder="Min Level"
          value={form.minLevel}
          onChange={handleFormChange}
        />
        <button onClick={handleAddInventoryItem}>Add Stock</button>
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
              <th>Min</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="loading-text">
                  No inventory items yet.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLow = item.quantity <= item.minLevel;
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id}>
                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          name="itemName"
                          value={editForm.itemName}
                          onChange={onEditChange}
                        />
                      ) : (
                        item.itemName
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          name="category"
                          value={editForm.category}
                          onChange={onEditChange}
                        />
                      ) : (
                        item.category
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          name="quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={onEditChange}
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          name="minLevel"
                          type="number"
                          value={editForm.minLevel}
                          onChange={onEditChange}
                        />
                      ) : (
                        item.minLevel
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${isLow ? "low" : "ok"}`}>
                        {isLow ? "Low" : "OK"}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{formatDate(item.updatedAt)}</td>
                    <td>
                      <div className="row-actions">
                        {isEditing ? (
                          <>
                            <button className="small-action" onClick={() => saveEdit(item.id)}>
                              Save
                            </button>
                            <button className="ghost-action" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="small-action" onClick={() => startEdit(item)}>
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteInventoryItem(item.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockListPage;
