import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './hms/dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import HostelTypeMaster from './hms/hosteltypemaster';
import StateForm from './hms/statemaster';
import CityForm from './hms/citymaster';
import EmployeeForm from './hms/employeemaster';
import HostelMasterForm from './hms/hostelmaster';
import BlockMaster from './hms/blockmaster';
import RoomMaster from './hms/roommaster';
import FeeMaster from './hms/feemaster';
import RoleForm from './hms/rolemaster';
import TermAndConditionMaster from './hms/termandconditionmaster';
import HostlerForm from './hms/hostlermaster';
import RoleMenuLinkingForm from './hms/rolemenulinking';
import HostelMenuLinking from './hms/hostelmenulinking';
import HostelEmployeeLinking from './hms/hostelemployeelinking';
import PaymentMaster from './hms/paymentmaster';
import OtherCharges from './hms/othercharges';
import PendingHostlerList from './hms/pendinghostlerlist';
import RoomAllotmentVacateTransfer from './hms/roomallotmentvacatetransfer';
import FeeDeposit from './hms/feedeposit';
import VisitorMaster from './hms/visitormaster';
import MessageMaster from './hms/messagemaster';
import MessageSendTo from './hms/messagesendto';
import FeedbackMaster from './hms/feedbackmaster';
import DailyExpenseMaster from './hms/dailyexpensemaster';
import DailyExpensePayment from './hms/dailyexpensepayment';
import GuestOtherCharges from './hms/guestothercharges';
import BedAvailability from './hms/bedavailability';
import LoginForm from './components/login';
import { useNavigate } from 'react-router-dom';
import { setupAutoLogout } from './authUtils';

// Layout with Topbar & Sidebar
const AppLayout = () => (
  <>
    <Topbar />
    <Sidebar />
    <main id="main" className="main-content">
      <Outlet />
    </main>
  </>
);

// Authentication check wrapper
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const logout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    if (token) {
      setupAutoLogout(token, logout);
    }
  }, [navigate]);

  useEffect(() => {
    // Import Bootstrap JS for dropdowns and collapse
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginForm />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="hms/dashboard" element={<Dashboard />} />
        <Route path="hms/statemaster" element={<StateForm />} />
        <Route path="hms/citymaster" element={<CityForm />} />
        <Route path="hms/rolemaster" element={<RoleForm />} />
        <Route path="hms/employeemaster" element={<EmployeeForm />} />
        <Route path="hms/rolemenulinking" element={<RoleMenuLinkingForm />} />
        <Route path="hms/hostelmenulinking" element={<HostelMenuLinking />} />
        <Route path="hms/hostelemployeelinking" element={<HostelEmployeeLinking />} />
        <Route path="hms/hosteltypemaster" element={<HostelTypeMaster />} />
        <Route path="hms/hostelmaster" element={<HostelMasterForm />} />
        <Route path="hms/blockmaster" element={<BlockMaster />} />
        <Route path="hms/roommaster" element={<RoomMaster />} />
        <Route path="hms/feemaster" element={<FeeMaster />} />
        <Route path="hms/termandconditionmaster" element={<TermAndConditionMaster />} />
        <Route path="hms/hostlermaster" element={<HostlerForm />} />
        <Route path="hms/paymentmaster" element={<PaymentMaster />} />
        <Route path="hms/othercharges" element={<OtherCharges />} />
        <Route path="hms/pendinghostlerlist" element={<PendingHostlerList />} />
        <Route path="hms/roomallotmentvacatetransfer" element={<RoomAllotmentVacateTransfer />} />
        <Route path="hms/feedeposit" element={<FeeDeposit />} />
        <Route path="hms/visitormaster" element={<VisitorMaster />} />
        <Route path="hms/messagemaster" element={<MessageMaster />} />
        <Route path="hms/messagesendto" element={<MessageSendTo />} />
        <Route path="hms/feedbackmaster" element={<FeedbackMaster />} />
        <Route path="hms/dailyexpensemaster" element={<DailyExpenseMaster />} />
        <Route path="hms/dailyexpensepayment" element={<DailyExpensePayment />} />
        <Route path="hms/guestothercharges" element={<GuestOtherCharges />} />
        <Route path="hms/bedavailability" element={<BedAvailability />} />

        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route index element={<Navigate to="/hms/dashboard" />} />
        <Route path="*" element={<Navigate to="/hms/dashboard" />} />
      </Route>

      {/* Catch-all: if logged out and hits unknown path */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
