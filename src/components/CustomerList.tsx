import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Phone, Mail, DollarSign } from 'lucide-react';
import { useCustomers } from '../hooks/useElectron';
import { AdvancedSearch } from './AdvancedSearch';
import { CustomerForm } from './CustomerForm';
import type { Customer } from '../types';

export const CustomerList: React.FC = () => {
  const { customers, loading, error, deleteCustomer } = useCustomers();
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  React.useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      try {
        await deleteCustomer(id);
      } catch (error) {
        alert('Failed to delete customer');
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        customers={customers}
        onFilteredResults={setFilteredCustomers}
        onSearchChange={setSearchTerm}
      />

      {/* Results Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Showing <span className="font-semibold">{filteredCustomers.length}</span> of{' '}
          <span className="font-semibold">{customers.length}</span> customers
          {searchTerm && (
            <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>
          )}
        </p>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                <div className="flex items-center gap-1 text-gray-600 mt-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(customer)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id, customer.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Credit:</span>
                <span className="font-medium">${customer.totalCredit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Paid:</span>
                <span className="font-medium text-green-600">${customer.totalPaid}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Balance:</span>
                <span className={`font-bold ${
                  customer.balance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${customer.balance}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                <DollarSign className="h-4 w-4" />
                Record Payment
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search term' : 'Get started by adding your first customer'}
          </p>
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleCloseForm}
          onSave={() => handleCloseForm()}
        />
      )}
    </div>
  );
};