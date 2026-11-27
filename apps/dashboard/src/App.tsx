import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { store } from './app/store';
import { AppProviders } from './components/AppProviders';
import { ProtectedRoute } from './features/auth/RouteGuards';
import { AdminLayout } from './components/AdminLayout';
import { AccountPage } from './pages/AccountPage';
import { AuditPage } from './pages/AuditPage';
import { OrdersPage } from './pages/OrdersPage';
import { PackagesPage } from './pages/PackagesPage';
import { UsersPage } from './pages/UsersPage';
import { ApartmentsPage } from './pages/ApartmentsPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { HomePage } from './pages/HomePage';
import { LandmarksPage } from './pages/LandmarksPage';
import { LocationsPage } from './pages/LocationsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Provider store={store}>
      <AppProviders>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/buildings" element={<BuildingsPage />} />
              <Route path="/apartments" element={<ApartmentsPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/landmarks" element={<LandmarksPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppProviders>
    </Provider>
  );
}
