import "./InventoryPages.css";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import panelBg from "../../assets/bg.webp";
import CompanyBrand from "../CompanyBrand";
import CompanyFooter from "../CompanyFooter";
import {
  createInventoryItem,
  createOrder,
  createStaffLog,
  getInventory,
  getOrders,
  getReorderPredictions,
  getStaffLogs,
  markOrderDelivered,
  removeInventoryItem,
  updateInventoryItem,
} from "../../services/inventoryApi";

function InventoryLayout() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    quantity: "",
    minLevel: "",
  });
  const [items, setItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    itemName: "",
    quantity: "",
    staffName: "",
  });
  const [staffForm, setStaffForm] = useState({
    staffName: "",
    task: "",
    itemName: "",
    quantity: "",
    status: "In Progress",
  });
  const [orders, setOrders] = useState([]);
  const [staffLogs, setStaffLogs] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [staffLogsLoading, setStaffLogsLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [forecastModel, setForecastModel] = useState(null);
  const [forecastSummary, setForecastSummary] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    const rawUser = sessionStorage.getItem("authUser");
    if (!rawUser) return;
    try {
      setAuthUser(JSON.parse(rawUser));
    } catch (_error) {
      sessionStorage.removeItem("authUser");
    }
  }, []);

  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      setOrdersLoading(true);
      setStaffLogsLoading(true);
      setForecastLoading(true);
      try {
        const [
          loadedItems,
          loadedOrders,
          loadedStaffLogs,
          forecastResponse,
        ] = await Promise.all([
          getInventory(),
          getOrders(),
          getStaffLogs(),
          getReorderPredictions(),
        ]);
        setItems(loadedItems);
        setOrders(loadedOrders);
        setStaffLogs(loadedStaffLogs);
        setForecast(forecastResponse.predictions || []);
        setForecastModel(forecastResponse.model || null);
        setForecastSummary(forecastResponse.summary || null);
      } catch (error) {
        alert(error.message || "Unable to load inventory details right now.");
      } finally {
        setLoading(false);
        setOrdersLoading(false);
        setStaffLogsLoading(false);
        setForecastLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

  const syncForecast = async () => {
    setForecastLoading(true);
    try {
      const forecastResponse = await getReorderPredictions();
      setForecast(forecastResponse.predictions || []);
      setForecastModel(forecastResponse.model || null);
      setForecastSummary(forecastResponse.summary || null);
    } catch (_error) {
      // Keep the latest successful forecast visible if a refresh fails.
    } finally {
      setForecastLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    setAuthUser(null);
    navigate("/login");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInventoryItem = async () => {
    const itemName = form.itemName.trim();
    const category = form.category.trim();
    const quantity = Number(form.quantity);
    const minLevel = Number(form.minLevel);

    if (!itemName || !category || Number.isNaN(quantity) || Number.isNaN(minLevel)) {
      alert("Please fill all inventory fields.");
      return;
    }

    try {
      const newItem = await createInventoryItem({
        itemName,
        category,
        quantity,
        minLevel,
      });
      setItems((prev) => [newItem, ...prev]);
      setForm({ itemName: "", category: "", quantity: "", minLevel: "" });
      await syncForecast();
    } catch (error) {
      alert(error.message || "Unable to add the stock item right now.");
    }
  };

  const handleDeleteInventoryItem = async (id) => {
    try {
      await removeInventoryItem(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      await syncForecast();
    } catch (error) {
      alert(error.message || "Unable to delete the stock item right now.");
    }
  };

  const handleUpdateInventoryItem = async (id, payload) => {
    const itemName = String(payload?.itemName || "").trim();
    const category = String(payload?.category || "").trim();
    const quantity = Number(payload?.quantity);
    const minLevel = Number(payload?.minLevel);

    if (!itemName || !category || Number.isNaN(quantity) || Number.isNaN(minLevel)) {
      alert("Please fill all inventory fields.");
      return false;
    }

    if (quantity < 0 || minLevel < 0) {
      alert("Quantity and Min Level must be 0 or more.");
      return false;
    }

    try {
      const updated = await updateInventoryItem(id, {
        itemName,
        category,
        quantity,
        minLevel,
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      await syncForecast();
      return true;
    } catch (error) {
      alert(error.message || "Unable to update the stock item right now.");
      return false;
    }
  };

  const updateQuantity = async (id, delta) => {
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem) return;

    const nextQuantity = Math.max(0, Number(currentItem.quantity || 0) + delta);

    try {
      const updated = await updateInventoryItem(id, {
        itemName: currentItem.itemName,
        category: currentItem.category,
        quantity: nextQuantity,
        minLevel: currentItem.minLevel,
      });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      await syncForecast();
    } catch (error) {
      alert(error.message || "Unable to update stock quantity right now.");
    }
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrder = async () => {
    const itemName = orderForm.itemName.trim();
    const staffName = orderForm.staffName.trim();
    const quantity = Number(orderForm.quantity);
    if (!itemName || !staffName || Number.isNaN(quantity) || quantity <= 0) {
      alert("Please enter valid order details.");
      return;
    }

    try {
      const newOrder = await createOrder({ itemName, staffName, quantity });
      setOrders((prev) => [newOrder, ...prev]);
      setOrderForm({ itemName: "", quantity: "", staffName: "" });
      await syncForecast();
    } catch (error) {
      alert(error.message || "Unable to create the order right now.");
    }
  };

  const handleMarkDelivered = async (id) => {
    const current = orders.find((x) => x.id === id);
    if (!current || current.status === "Delivered") return;

    try {
      const { order, inventoryItem } = await markOrderDelivered(id);

      if (order) {
        setOrders((prev) => prev.map((item) => (item.id === id ? order : item)));
      }

      if (inventoryItem) {
        setItems((prev) =>
          prev.map((item) => (item.id === inventoryItem.id ? inventoryItem : item))
        );
      }

      await syncForecast();
    } catch (error) {
      alert(error.message || "Unable to update the order right now.");
    }
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStaffLog = async () => {
    const staffName = staffForm.staffName.trim();
    const task = staffForm.task.trim();
    const itemName = staffForm.itemName.trim();
    const quantity = Number(staffForm.quantity);
    if (!staffName || !task || !itemName || Number.isNaN(quantity)) {
      alert("Please enter valid staff task details.");
      return;
    }

    try {
      const newLog = await createStaffLog({
        staffName,
        task,
        itemName,
        quantity,
        status: staffForm.status,
      });
      setStaffLogs((prev) => [newLog, ...prev]);
      setStaffForm({
        staffName: "",
        task: "",
        itemName: "",
        quantity: "",
        status: "In Progress",
      });
      await syncForecast();
    } catch (error) {
      alert(error.message || "Unable to save the staff update right now.");
    }
  };

  const totals = useMemo(() => {
    const totalItems = items.length;
    const totalUnits = items.reduce((sum, x) => sum + x.quantity, 0);
    const lowStock = items.filter((x) => x.quantity <= x.minLevel).length;
    const outOfStock = items.filter((x) => x.quantity === 0).length;
    const orderedUnits = orders
      .filter((x) => x.status === "Ordered")
      .reduce((sum, x) => sum + x.quantity, 0);
    const deliveredUnits = orders
      .filter((x) => x.status === "Delivered")
      .reduce((sum, x) => sum + x.quantity, 0);
    const activeStaff = new Set(
      staffLogs
        .filter((x) => x.status === "In Progress")
        .map((x) => x.staffName.toLowerCase())
    ).size;

    return {
      totalItems,
      totalUnits,
      lowStock,
      outOfStock,
      orderedUnits,
      deliveredUnits,
      activeStaff,
    };
  }, [items, orders, staffLogs]);

  const contextValue = {
    loading,
    ordersLoading,
    staffLogsLoading,
    items,
    totals,
    forecast,
    forecastModel,
    forecastSummary,
    forecastLoading,
    form,
    orderForm,
    orders,
    staffForm,
    staffLogs,
    handleFormChange,
    handleAddInventoryItem,
    handleDeleteInventoryItem,
    handleUpdateInventoryItem,
    updateQuantity,
    handleOrderChange,
    handleAddOrder,
    handleMarkDelivered,
    handleStaffChange,
    handleAddStaffLog,
  };

  return (
    <div className="stock-shell">
      <header className="topbar navbar navbar-expand-lg">
        <div className="container-xl">
          <CompanyBrand />
          <button
            className="navbar-toggler bg-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#stockNavbar"
            aria-controls="stockNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <nav className="collapse navbar-collapse" id="stockNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <Link to="/" className="nav-link">
                Home
              </Link>
              <NavLink to="/stock/dashboard" className="nav-link">
                Inventory
              </NavLink>
              <Link to="/billing" className="nav-link">
                Costing
              </Link>
              <Link to="/gps" className="nav-link">
                GPS
              </Link>
              {authUser && (
                <div className="profile-nav ms-lg-2 mt-2 mt-lg-0">
                  <div className="avatar">
                    {String(authUser?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-text">
                    <strong>{authUser?.name || "User"}</strong>
                    <span>{authUser?.role || "staff"}</span>
                  </div>
                  <button type="button" className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div
        className="stock-dash-page"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url(${panelBg})`,
        }}
      >
        <div className="stock-dash-top">
          <h2>Inventory Dashboard</h2>
          <div className="kpi-inline">
            <span>Items: {totals.totalItems}</span>
            <span>Units: {totals.totalUnits}</span>
            <span>Low: {totals.lowStock}</span>
            <span>Out: {totals.outOfStock}</span>
            <span>Active Staff: {totals.activeStaff}</span>
          </div>
        </div>

        <div className="stock-dash-layout">
          <aside className="left-menu">
            <NavLink
              to="/stock/dashboard"
              className={({ isActive }) => `process-link ${isActive ? "active" : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/stock/list"
              className={({ isActive }) => `process-link ${isActive ? "active" : ""}`}
            >
              Stock List
            </NavLink>
            <NavLink
              to="/stock/orders"
              className={({ isActive }) => `process-link ${isActive ? "active" : ""}`}
            >
              Order Tracking
            </NavLink>
            <NavLink
              to="/stock/staff"
              className={({ isActive }) => `process-link ${isActive ? "active" : ""}`}
            >
              Staff Tracking
            </NavLink>
          </aside>

          <main className="main-panel">
            <Outlet context={contextValue} />
          </main>
        </div>
      </div>

      <CompanyFooter />
    </div>
  );
}

export default InventoryLayout;
