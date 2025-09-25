import React, { useState, useEffect } from 'react';
import { IndianRupee, Search, Filter, Plus, Trash2, Edit, Eye } from 'lucide-react';
import type { Transaction } from '../types';
import { apiService } from '../services/api';
import TransactionForm from './TransactionForm';

export const Transactions: React.FC = () => { 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check URL parameters for action=new
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (urlParams.get('action') === 'new') {
      setShowForm(true);
    }
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Fetch transactions from API
        const response: any = await apiService.transactions.getAll();
        if (response && response.success) {
          setTransactions(response.data);
        } else {
          // Handle API failure
          console.error('Failed to fetch transactions data');
          setTransactions([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t._id || t.id).filter(id => id));
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setDeleting(true);
      await apiService.transactions.delete(transactionId);
      // Dispatch custom event to notify other components to refresh data
      window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'transaction', action: 'delete' } }));
      // Refresh the transactions list
      const fetchTransactions = async () => {
        try {
          const response: any = await apiService.transactions.getAll();
          if (response && response.success) {
            setTransactions(response.data);
          }
        } catch (error) {
          console.error('Error refreshing transactions:', error);
        }
      };
      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      setDeleting(true);
      await apiService.transactions.deleteMultiple(selectedTransactions);
      setSelectedTransactions([]);
      setShowDeleteConfirm(false);
      // Dispatch custom event to notify other components to refresh data
      window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'transaction', action: 'delete', count: selectedTransactions.length } }));
      // Refresh the transactions list
      const fetchTransactions = async () => {
        try {
          const response: any = await apiService.transactions.getAll();
          if (response && response.success) {
            setTransactions(response.data);
          }
        } catch (error) {
          console.error('Error refreshing transactions:', error);
        }
      };
      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transactions:', error);
      alert('Failed to delete transactions');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTransactions = (transactions || []).filter(transaction => {
    const customerName = transaction.customer?.name || 
                        (typeof transaction.customerId === 'object' && transaction.customerId ? transaction.customerId.name : null) || 
                        transaction.customerName || 
                        '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesFilter = filterStatus === 'ALL' || transaction.status === filterStatus;
    
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
            placeholder="Search transactions..."
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

          {selectedTransactions.length > 0 && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedTransactions.length})
            </button>
          )}
          
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction._id || transaction.id)}
                        onChange={() => {
                          const id = transaction._id || transaction.id;
                          if (id) handleSelectTransaction(id);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer?.name || 
                         (typeof transaction.customerId === 'object' && transaction.customerId ? transaction.customerId.name : null) || 
                         transaction.customerName || 
                         'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customer?.phone || 
                         (typeof transaction.customerId === 'object' && transaction.customerId ? transaction.customerId.phone : null) || 
                         ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex p-1 rounded-full mr-2 ${transaction.type === 'invoice' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          <IndianRupee className={`h-4 w-4 ${transaction.type === 'invoice' ? 'text-blue-600' : 'text-green-600'}`} />
                        </span>
                        <span className="text-sm text-gray-900">{transaction.type}</span>
                      </div>
                      <div className="text-xs text-gray-500">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{transaction.amount.toFixed(2)}</div>
                      {transaction.type === 'invoice' && transaction.status !== 'completed' && (
                        <div className="text-xs text-gray-500">
                          Status: {transaction.status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button 
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setShowForm(true);
                          }} 
                          className="flex items-center gap-1 text-green-600 hover:text-green-800"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            const id = transaction._id || transaction.id;
                            if (id) handleDeleteTransaction(id);
                          }}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Transactions
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedTransactions.length} transaction(s)? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMultiple}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
