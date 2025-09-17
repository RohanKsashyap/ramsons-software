import React, { useState } from 'react';
import { BarChart, PieChart, Calendar, Download, RefreshCw } from 'lucide-react';

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', icon: <BarChart size={20} /> },
    { id: 'customers', label: 'Customer Report', icon: <PieChart size={20} /> },
    { id: 'outstanding', label: 'Outstanding Balances', icon: <BarChart size={20} /> },
    { id: 'payments', label: 'Payment History', icon: <BarChart size={20} /> },
  ];

  const dateRanges = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    setShowCustomRange(range === 'custom');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Financial Reports</h3>
            <p className="text-sm text-gray-500">Generate and view detailed financial reports</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Report Type Selection */}
          <div className="w-full md:w-1/4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Report Type</h4>
            <div className="space-y-2">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${activeReport === report.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="mr-3">{report.icon}</span>
                  <span className="font-medium">{report.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Report Configuration */}
          <div className="w-full md:w-3/4">
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Date Range</h4>
              <div className="flex flex-wrap gap-2">
                {dateRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => handleDateRangeChange(range.id)}
                    className={`px-4 py-2 rounded-lg text-sm ${dateRange === range.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              {showCustomRange && (
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="date"
                        id="start-date"
                        className="pl-10 pr-4 py-2 border rounded-lg w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="date"
                        id="end-date"
                        className="pl-10 pr-4 py-2 border rounded-lg w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Report Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              {activeReport === 'sales' && (
                <div className="text-center">
                  <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Sales Report</h4>
                  <p className="text-gray-500">Sales data visualization will appear here</p>
                </div>
              )}
              
              {activeReport === 'customers' && (
                <div className="text-center">
                  <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Customer Report</h4>
                  <p className="text-gray-500">Customer data visualization will appear here</p>
                </div>
              )}
              
              {activeReport === 'outstanding' && (
                <div className="text-center">
                  <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Outstanding Balances</h4>
                  <p className="text-gray-500">Outstanding balance data will appear here</p>
                </div>
              )}
              
              {activeReport === 'payments' && (
                <div className="text-center">
                  <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Payment History</h4>
                  <p className="text-gray-500">Payment history data will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;