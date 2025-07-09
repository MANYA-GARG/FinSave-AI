import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HomeNavbar from "./components/HomeNavbar";
import MainNavbar from "./components/MainNavbar";
import Transactions from "./pages/Transactions";
import SplitExpense from "./pages/SplitExpense";
import Badges from "./pages/Badges";
import AiAssistant from "./pages/AiAssistant";
import Wallet from "./pages/Wallet";
import FHS from "./pages/FHS";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import ApproveTransaction from "./pages/ApproveTransaction";
import RejectTransaction from "./pages/RejectTransaction";


const AppWrapper = () => {
  const location = useLocation();

  // Paths where navbar should be hidden
  const noNavbarPaths = ["/", "/login", "/register"];

  return (
    <>
      {/* Conditional Navbars */}
      {location.pathname === "/" && <HomeNavbar />}
      {!noNavbarPaths.includes(location.pathname) && <MainNavbar />}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/split" element={<SplitExpense />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/FHS" element={<FHS />} />
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />
        <Route path="/approve/:txnId" element={<ApproveTransaction />} />
       <Route path="/reject/:txnId" element={<RejectTransaction />} />

      </Routes>

      {/* Toasts show on every page */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
