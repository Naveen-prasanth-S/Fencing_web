import { useOutletContext } from "react-router-dom";
import InventoryOverview from "./InventoryOverview";

function InventoryDashboardPage() {
  const { items, totals, forecast, forecastModel, forecastSummary, forecastLoading } =
    useOutletContext();

  return (
    <InventoryOverview
      items={items}
      totals={totals}
      forecast={forecast}
      forecastModel={forecastModel}
      forecastSummary={forecastSummary}
      forecastLoading={forecastLoading}
    />
  );
}

export default InventoryDashboardPage;
