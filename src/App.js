import { Navigate, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import StaffHome from "./components/StaffHome";
import StaffStockListPage from "./components/staff/StaffStockListPage";
import StaffOrdersPage from "./components/staff/StaffOrdersPage";
import StaffLayout from "./components/staff/StaffLayout";
import BillingCalculation from "./components/BillingCalculation";
import GPSTracker from "./components/GPSTracker";
import Otp from "./components/otp";
import InventoryLayout from "./components/inventory/InventoryLayout";
import InventoryDashboardPage from "./components/inventory/InventoryDashboardPage";
import StockEntryPage from "./components/inventory/StockEntryPage";
import StockListPage from "./components/inventory/StockListPage";
import OrderTrackingPage from "./components/inventory/OrderTrackingPage";
import StaffTrackingPage from "./components/inventory/StaffTrackingPage";

function isAuthenticated() {
  try {
    const raw = sessionStorage.getItem("authUser");
    return Boolean(raw && JSON.parse(raw));
  } catch {
    sessionStorage.removeItem("authUser");
    return false;
  }
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<StaffHome />} />
        <Route path="stock-list" element={<StaffStockListPage />} />
        <Route path="orders" element={<StaffOrdersPage />} />
      </Route>
      <Route path="/staff-home" element={<Navigate to="/staff/home" replace />} />

      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/otp"
        element={
          <ProtectedRoute>
            <Otp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <InventoryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InventoryDashboardPage />} />
        <Route path="entry" element={<StockEntryPage />} />
        <Route path="list" element={<StockListPage />} />
        <Route path="orders" element={<OrderTrackingPage />} />
        <Route path="staff" element={<StaffTrackingPage />} />
      </Route>

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingCalculation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gps"
        element={
          <ProtectedRoute>
            <GPSTracker />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
