/**
 * App.jsx — Root application component.
 *
 * Wraps the app with:
 *  - AuthProvider (demo-mode auth context)
 *  - BrowserRouter (React Router)
 *  - AppRoutes (all route definitions)
 */
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import DemoRoleSwitcher from './components/common/DemoRoleSwitcher';

// Global styles (order matters — global first, then layout, forms, tables, dashboard)
import './styles/global.css';
import './styles/layout.css';
import './styles/forms.css';
import './styles/tables.css';
import './styles/dashboard.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <DemoRoleSwitcher />
      </AuthProvider>
    </BrowserRouter>
  );
}
