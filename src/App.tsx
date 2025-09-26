import { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { Calculator, CreditCard, IndianRupee, FileText, Home, PieChart, Settings, Users } from 'lucide-react';

// Import all page components
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Customers } from './components/Customers';
import { Invoices } from './components/Invoices';
import { Reports } from './components/Reports';
import { Calculator as CalculatorComponent } from './components/Calculator';
import { Payments } from './components/Payments';
import { Setting } from './components/Setting';
import { NotificationManager } from './components/NotificationManager';
import { dueDateNotificationService } from './services/dueDateNotificationService';
import { backgroundNotificationService } from './services/backgroundNotificationService';
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'reset'>('login');

  const { user, logout } = useAuth();

  // Initialize notification services
  useEffect(() => {
    // Initialize due date notification service
    console.log('Initializing due date notification service...');
    
    // Initialize background notification service
    console.log('Initializing background notification service...');
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const tabId = hash.split('?')[0] || 'dashboard';
      if (menuItems.some(item => item.id === tabId)) {
        setActiveTab(tabId);
      }
    };

    // Set initial tab based on URL hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <IndianRupee size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={20} /> },
    { id: 'reports', label: 'Reports', icon: <PieChart size={20} /> },
    { id: 'calculator', label: 'Calculator', icon: <Calculator size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Ramsons Accounting</h1>
            {user ? (
              <button
                onClick={logout}
                className="flex items-center space-x-1 rounded-md bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                title="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center space-x-1 rounded-md bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
                title="Log in"
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
          {user && (
            <p className="mt-2 text-sm text-gray-600 truncate" title={user.email}>
              Signed in as {user.email}
            </p>
          )}
        </div>
        <nav className="mt-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    window.location.hash = `#/${item.id}`;
                  }}
                  className={`flex items-center w-full px-4 py-2 text-left ${activeTab === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  disabled={!user}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {!user && (
          <div className="border-t p-4 text-sm text-gray-600">
            <p className="mb-2 font-semibold">Please log in</p>
            <p className="mb-4">Login to access the dashboard, customers, transactions, and more.</p>
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">
            {user ? `Welcome back, ${user.email}` : 'You are browsing as a guest'}
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-800">Login required</h3>
            <p className="mt-3 text-gray-600">Please log in to manage customers, transactions, reports, and more features.</p>
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="mt-6 rounded-md bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              Sign in to continue
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                <Dashboard />
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Transactions</h2>
                <Transactions />
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Customers</h2>
                <Customers />
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Invoices</h2>
                <Invoices />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Reports</h2>
                <Reports />
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Calculator</h2>
                <CalculatorComponent />
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Payments</h2>
                <Payments />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <Setting />
              </div>
            )}
          </>
        )}
      </div>

      {/* Notification Manager */}
      <NotificationManager maxNotifications={5} position="top-right" />

      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchMode={(modeValue) => {
          setAuthMode(modeValue);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;