function OrdersPanel({
  orderForm,
  orders,
  loading,
  onOrderChange,
  onAddOrder,
  onMarkDelivered,
}) {
  return (
    <>
      <div className="panel-card">
        <h3>Order Entry</h3>
        <div className="entry-form three-col">
          <input
            name="itemName"
            placeholder="Item Ordered"
            value={orderForm.itemName}
            onChange={onOrderChange}
          />
          <input
            name="quantity"
            type="number"
            placeholder="Order Qty"
            value={orderForm.quantity}
            onChange={onOrderChange}
          />
          <input
            name="staffName"
            placeholder="Assigned Staff"
            value={orderForm.staffName}
            onChange={onOrderChange}
          />
          <button className="full-span" onClick={onAddOrder}>Add Order</button>
        </div>
      </div>

      <div className="panel-card mt-lg">
        <h3>Order Status</h3>
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
            {loading ? (
              <tr>
                <td colSpan={5} className="loading-text">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="loading-text">No orders added yet.</td>
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
                      onClick={() => onMarkDelivered(order.id)}
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
    </>
  );
}

export default OrdersPanel;
