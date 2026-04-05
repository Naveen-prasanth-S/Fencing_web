import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../inventory/InventoryPages.css";
import {
  createStaffLog,
  getOrders,
  getStaffLogs,
  markOrderDelivered,
  updateStaffLog,
} from "../../services/inventoryApi";

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function StaffLayout() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [staffLogs, setStaffLogs] = useState([]);
  const [activityForm, setActivityForm] = useState({
    task: "",
    itemName: "",
    quantity: "",
    status: "In Progress",
  });

  useEffect(() => {
    const rawUser = sessionStorage.getItem("authUser");
    if (!rawUser) {
      setReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      setAuthUser(parsed);
    } catch (_error) {
      sessionStorage.removeItem("authUser");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!authUser || authUser.role !== "staff") return;

    let ignore = false;

    const fetchStaffData = async () => {
      setLoading(true);
      try {
        const [loadedOrders, loadedStaffLogs] = await Promise.all([
          getOrders(),
          getStaffLogs(),
        ]);

        if (ignore) return;
        setOrders(loadedOrders);
        setStaffLogs(loadedStaffLogs);
      } catch (error) {
        if (!ignore) {
          alert(error.message || "Failed to load staff workspace.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchStaffData();

    return () => {
      ignore = true;
    };
  }, [authUser]);

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    navigate("/login");
  };

  const currentStaffName = useMemo(
    () => normalizeValue(authUser?.name),
    [authUser]
  );

  const myOrders = useMemo(
    () =>
      orders.filter(
        (order) => normalizeValue(order.staffName) === currentStaffName
      ),
    [orders, currentStaffName]
  );

  const myStaffLogs = useMemo(
    () =>
      staffLogs.filter(
        (log) => normalizeValue(log.staffName) === currentStaffName
      ),
    [staffLogs, currentStaffName]
  );

  const staffMetrics = useMemo(() => {
    const assignedOrders = myOrders.length;
    const pendingOrders = myOrders.filter(
      (order) => order.status !== "Delivered"
    ).length;
    const deliveredOrders = myOrders.filter(
      (order) => order.status === "Delivered"
    ).length;
    const totalTasks = myStaffLogs.length;
    const inProgressTasks = myStaffLogs.filter(
      (log) => log.status === "In Progress"
    ).length;
    const completedTasks = myStaffLogs.filter(
      (log) => log.status === "Completed"
    ).length;
    const pendingTasks = myStaffLogs.filter(
      (log) => log.status === "Pending"
    ).length;

    const deliveryRate = assignedOrders
      ? Math.round((deliveredOrders / assignedOrders) * 100)
      : 0;
    const taskCompletionRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      assignedOrders,
      pendingOrders,
      deliveredOrders,
      totalTasks,
      inProgressTasks,
      completedTasks,
      pendingTasks,
      deliveryRate,
      taskCompletionRate,
    };
  }, [myOrders, myStaffLogs]);

  const handleMarkDelivered = async (id) => {
    try {
      const { order } = await markOrderDelivered(id);

      if (order) {
        setOrders((prev) => prev.map((item) => (item.id === id ? order : item)));
      }
    } catch (error) {
      alert(error.message || "Failed to update work order.");
    }
  };

  const handleActivityChange = (event) => {
    const { name, value } = event.target;
    setActivityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddActivity = async () => {
    const task = activityForm.task.trim();
    const itemName = activityForm.itemName.trim();
    const quantity = Number(activityForm.quantity);

    if (!task || !itemName || Number.isNaN(quantity) || quantity < 0) {
      alert("Please enter valid task details.");
      return;
    }

    try {
      const newLog = await createStaffLog({
        staffName: authUser?.name || "Staff",
        task,
        itemName,
        quantity,
        status: activityForm.status,
      });

      setStaffLogs((prev) => [newLog, ...prev]);
      setActivityForm({
        task: "",
        itemName: "",
        quantity: "",
        status: "In Progress",
      });
    } catch (error) {
      alert(error.message || "Failed to add task update.");
    }
  };

  const handleUpdateActivityStatus = async (id, status) => {
    const currentLog = staffLogs.find((log) => log.id === id);
    if (!currentLog) return;

    try {
      const updatedLog = await updateStaffLog(id, {
        task: currentLog.task,
        itemName: currentLog.itemName,
        quantity: currentLog.quantity,
        status,
      });

      setStaffLogs((prev) =>
        prev.map((log) => (log.id === id ? updatedLog : log))
      );
    } catch (error) {
      alert(error.message || "Failed to update task status.");
    }
  };

  if (!ready) return null;
  if (!authUser) return <Navigate to="/login" replace />;
  if (authUser.role !== "staff") return <Navigate to="/" replace />;

  return (
    <div className="stock-shell">
      <header className="topbar navbar navbar-expand-lg">
        <div className="container-xl">
          <span className="brand navbar-brand mb-0">FencingMS Staff</span>
          <button
            className="navbar-toggler bg-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#staffNavbar"
            aria-controls="staffNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <nav className="collapse navbar-collapse" id="staffNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <NavLink to="/staff/home" className="nav-link">
                Staff Home
              </NavLink>
              <NavLink to="/staff/work-orders" className="nav-link">
                Work Orders
              </NavLink>
              <NavLink to="/staff/task-updates" className="nav-link">
                Task Updates
              </NavLink>
              <NavLink to="/staff/performance" className="nav-link">
                Performance
              </NavLink>
              <div className="profile-nav ms-lg-2 mt-2 mt-lg-0">
                <div className="avatar">
                  {String(authUser?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="profile-text">
                  <strong>{authUser?.name || "Staff"}</strong>
                  <span>{authUser?.role || "staff"}</span>
                </div>
                <button type="button" className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="container-xl py-3">
        <Outlet
          context={{
            authUser,
            loading,
            myOrders,
            myStaffLogs,
            staffMetrics,
            activityForm,
            handleMarkDelivered,
            handleActivityChange,
            handleAddActivity,
            handleUpdateActivityStatus,
          }}
        />
      </main>

      <footer id="contact" className="footer">
        <div className="container-xl">
          <div className="row g-3 align-items-start">
            <div className="col-lg-5">
              <h3 className="footer-title">FencingMS</h3>
              <p className="footer-text mb-2">
                Professional fencing solutions for homes, commercial spaces, and
                industrial sites.
              </p>
              <p className="footer-text mb-0">
                Address: 24/7 Industrial Road, Coimbatore, Tamil Nadu 641021
              </p>
            </div>
            <div className="col-lg-4">
              <h4 className="footer-subtitle">Contact</h4>
              <p className="footer-text mb-1">Phone: +91 98765 43210</p>
              <p className="footer-text mb-1">Email: support@fencingms.local</p>
              <p className="footer-text mb-0">
                Working Hours: Mon - Sat, 9:00 AM - 6:00 PM
              </p>
            </div>
            <div className="col-lg-3">
              <h4 className="footer-subtitle">Follow Us</h4>
              <div className="social-links">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  Facebook
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
          <hr className="footer-line" />
          <p className="footer-copy mb-0">
            Copyright {new Date().getFullYear()} FencingMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default StaffLayout;
