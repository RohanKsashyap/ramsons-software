import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Phone, Mail, MapPin, Trash2, Edit, Eye } from 'lucide-react';
import type { Customer } from '../types';
import { useCustomers } from '../hooks/useElectron';
import { CustomerForm } from './CustomerForm';
import { apiService } from '../services/api';

export const Customers: React.FC = () => {
  const { customers, loading, error } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check URL parameters for action=new
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (urlParams.get('action') === 'new') {
      setShowForm(true);
    }

    // Listen for data change events (e.g., when transactions are deleted)
    const handleDataChanged = (event: CustomEvent) => {
      if (event.detail?.type === 'transaction' && event.detail?.action === 'delete') {
        // Refresh customer data when transactions are deleted
        window.location.reload();
      }
    };

    window.addEventListener('dataChanged', handleDataChanged as EventListener);

    return () => {
      window.removeEventListener('dataChanged', handleDataChanged as EventListener);
    };
  }, []);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };
  
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === sortedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(sortedCustomers.map(c => c.id));
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setDeleting(true);
      await apiService.customers.delete(customerId);
      // Dispatch custom event to notify other components to refresh data
      window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'customer', action: 'delete' } }));
      // Refresh the customers list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      setDeleting(true);
      await apiService.customers.deleteMultiple(selectedCustomers);
      setSelectedCustomers([]);
      setShowDeleteConfirm(false);
      // Dispatch custom event to notify other components to refresh data
      window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'customer', action: 'delete', count: selectedCustomers.length } }));
      // Refresh the customers list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Failed to delete customers');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'balance') {
      return b.balance - a.balance;
    } else if (sortBy === 'recent') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers..."
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="balance">Sort by Balance</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>

            {selectedCustomers.length > 0 && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedCustomers.length})
              </button>
            )}
            
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              New Customer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCustomers.length > 0 ? (
            sortedCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                    
                    {customer.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    
                    {customer.address && (
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-1" />
                        <span>{customer.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Credit:</span>
                      <span className="text-sm font-medium">₹{customer.totalCredit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Paid:</span>
                      <span className="text-sm font-medium">₹{customer.totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Balance:</span>
                      <span className={`text-sm font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{customer.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 flex justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleCloseForm}
          onSave={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Customers
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedCustomers.length} customer(s)? 
              This action cannot be undone and will also delete all associated transactions.
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
    </>
  );
};

export default Customers;