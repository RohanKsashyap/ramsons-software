import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Download, Printer, Mail } from 'lucide-react';
import { apiService } from '../services/api';
import type { Transaction } from '../types';
import InvoiceForm from './InvoiceForm';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Transaction | null>(null);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await apiService.transactions.getAll();
      const transactionsData = response?.success ? response.data : Array.isArray(response) ? response : [];
      const invoiceData = transactionsData.filter((transaction: Transaction) =>
        transaction.type === 'invoice' || transaction.type === 'INVOICE'
      );
      setInvoices(invoiceData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const handleDataChanged = (event: CustomEvent<{ entity: string }>) => {
      if (event.detail.entity === 'invoice') {
        fetchInvoices();
      }
    };

    window.addEventListener('dataChanged', handleDataChanged as EventListener);

    return () => {
      window.removeEventListener('dataChanged', handleDataChanged as EventListener);
    };
  }, [fetchInvoices]);

  const handleInvoiceSaved = async () => {
    await fetchInvoices();
  };

  const filteredInvoices = invoices.filter(invoice => {
    const customerName = invoice.customer?.name ||
                        (invoice.customerId && typeof invoice.customerId === 'object' && (invoice.customerId as any)?.name ? (invoice.customerId as any).name : null) ||
                        invoice.customerName ||
                        '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || invoice.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              className="pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button 
            onClick={() => {
              setEditingInvoice(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">INV-{invoice._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customer?.name ||
                         (invoice.customerId && typeof invoice.customerId === 'object' && (invoice.customerId as any)?.name ? (invoice.customerId as any).name : null) ||
                         invoice.customerName ||
                         'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.customer?.phone ||
                         (invoice.customerId && typeof invoice.customerId === 'object' && (invoice.customerId as any)?.phone ? (invoice.customerId as any).phone : null) ||
                         ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{invoice.amount.toFixed(2)}</div>
                      {invoice.status !== 'completed' && (
                        <div className="text-xs text-gray-500">
                          Status: {invoice.status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                      {invoice.status === 'pending' && invoice.dueDate && new Date(invoice.dueDate) < new Date() && (
                        <div className="text-xs text-red-600 font-medium">
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800" title="View">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800" title="Print">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800" title="Email">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingInvoice(invoice);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800" 
                          title="Edit"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
          onSave={handleInvoiceSaved}
        />
      )}
    </div>
  );
};

export default Invoices;
