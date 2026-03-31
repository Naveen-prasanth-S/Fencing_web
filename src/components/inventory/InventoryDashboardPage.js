import { useOutletContext } from "react-router-dom";
import InventoryOverview from "./InventoryOverview";

function InventoryDashboardPage() {
  const { items, totals } = useOutletContext();
  return <InventoryOverview items={items} totals={totals} />;
}

export default InventoryDashboardPage;
