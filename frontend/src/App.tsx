import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics/:id" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
