import { useOutletContext } from "react-router-dom";
import OrdersPanel from "./OrdersPanel";

function OrderTrackingPage() {
  const {
    orderForm,
    orders,
    handleOrderChange,
    handleAddOrder,
    handleMarkDelivered,
  } = useOutletContext();

  return (
    <OrdersPanel
      orderForm={orderForm}
      orders={orders}
      onOrderChange={handleOrderChange}
      onAddOrder={handleAddOrder}
      onMarkDelivered={handleMarkDelivered}
    />
  );
}

export default OrderTrackingPage;
