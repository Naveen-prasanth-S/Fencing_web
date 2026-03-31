import { useOutletContext } from "react-router-dom";

function StockEntryPage() {
  const { form, handleFormChange, handleAddInventoryItem } = useOutletContext();

  return (
    <div className="panel-card">
      <h3>Stock Entry</h3>
      <p className="page-note">Add new items into inventory with category, quantity, and minimum level.</p>
      <div className="entry-form">
        <input name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleFormChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleFormChange} />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleFormChange} />
        <input name="minLevel" type="number" placeholder="Min Level" value={form.minLevel} onChange={handleFormChange} />
        <button onClick={handleAddInventoryItem}>Add Item</button>
      </div>
    </div>
  );
}

export default StockEntryPage;
