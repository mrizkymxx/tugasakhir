import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './layouts/AdminLayout';

import CreateOrder from './pages/CreateOrder';
import Orders from './pages/ListOrders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Layout */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/create" element={<CreateOrder />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          <Route path="/users" element={<Users />} />
        </Route>

        {/* Fallback pattern */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
