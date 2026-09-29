import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import People from "./pages/People.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import Groups from "./pages/Groups.jsx";
import GroupDetail from "./pages/GroupDetail.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import Settle from "./pages/Settle.jsx";
import TicketPage from "./pages/TicketPage.jsx";
import Pagenotfound from "./Pagenotfound"
export default function App() {
  const { user } = useAuth();

  // Logged out: only the auth pages exist.
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // key={user.id} gives every account a fresh, isolated ledger.
  return (
    <AppProvider key={user.id} user={user}>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/people" element={<People />} />
            <Route path="/people/:personId" element={<PersonDetail />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/settle" element={<Settle />} />
            <Route path="/*" element={<Pagenotfound />} />
            <Route path="/ticket/:expenseId" element={<TicketPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}
