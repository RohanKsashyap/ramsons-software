import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, TrendingUp, CreditCard, FileText } from 'lucide-react';
import type { Customer, Transaction } from '../types';
import { apiService } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import DueDateAlerts from './DueDateAlerts';
import NotificationTest from './NotificationTest';
import CustomerCreationDemo from './CustomerCreationDemo';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSales: 0,
    totalOutstanding: 0,
    overdueCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats from the new API endpoint
        const dashboardResponse = await apiService.dashboard.getStats();
        
        if (dashboardResponse && dashboardResponse.data) {
          const {
            totalCustomers,
            totalRevenue,
            totalOutstanding,
            overdueCount,
            recentTransactions: transactions
          } = dashboardResponse.data;

          // Set stats
          setStats({
            totalCustomers,
            totalSales: totalRevenue,
            totalOutstanding,
            overdueCount: overdueCount || 0
          });
          
          // Set recent transactions
          if (transactions && transactions.length > 0) {
            setRecentTransactions(transactions);
          }
        }
        
        // Fetch monthly revenue data
        const monthlyRevenueResponse = await apiService.dashboard.getMonthlyRevenue();
        if (monthlyRevenueResponse && monthlyRevenueResponse.data) {
          setMonthlyRevenue(monthlyRevenueResponse.data);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Show error state instead of using mock data
        setStats({
          totalCustomers: 0,
          totalSales: 0,
          totalOutstanding: 0,
          overdueCount: 0,
        });
        
        setRecentTransactions([]);
        setMonthlyRevenue([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toFixed(2)}`,
      icon: IndianRupee,
      color: 'green',
    },
    {
      title: 'Outstanding Amount',
      value: `₹${stats.totalOutstanding.toFixed(2)}`,
      icon: TrendingUp,
      color: 'yellow',
    },
    {
      title: 'Overdue Payments',
      value: stats.overdueCount,
      icon: AlertCircle,
      color: 'red',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
        {monthlyRevenue.length > 0 ? (
          <div className="h-64">
            <Bar
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Revenue',
                    data: monthlyRevenue,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                }
              }}
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No revenue data available</p>
        )}
      </div>

      {/* Due Date Alerts */}
      <DueDateAlerts />

      {/* Customer Creation Demo */}
      <CustomerCreationDemo />

      {/* Notification Test (for development) */}
      <NotificationTest />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.customer?.name ||
                       (transaction.customerId && typeof transaction.customerId === 'object' && (transaction.customerId as any)?.name ? (transaction.customerId as any).name : null) ||
                       transaction.customerName ||
                       'Unknown Customer'}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{transaction.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '#/customers?action=new'}
              className="w-full flex items-center gap-3 p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-700">Add New Customer</span>
            </button>
            <button 
              onClick={() => window.location.href = '#/transactions?action=new'}
              className="w-full flex items-center gap-3 p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <IndianRupee className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">Record Sale</span>
            </button>
            <button 
              onClick={() => window.location.href = '#/reports'}
              className="w-full flex items-center gap-3 p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-700">Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
