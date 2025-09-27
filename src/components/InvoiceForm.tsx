import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTransactions, useCustomers } from '../hooks/useElectron';
import type { Transaction, Customer } from '../types';
import CustomerSelector from './CustomerSelector';

interface InvoiceFormProps {
  invoice?: Transaction;
  onClose: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onClose }) => {
  const { createTransaction, updateTransaction } = useTransactions();
  const { customers } = useCustomers();
  const [loading, setLoading] = useState(false);
  
  // Set default due date to 30 days from now
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || '',
    amount: invoice?.amount?.toString() || '',
    description: invoice?.description || '',
    paymentMethod: invoice?.paymentMethod || 'credit',
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : getDefaultDueDate(),
    status: invoice?.status || 'pending'
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceData = {
        ...formData,
        type: 'invoice' as const, // Using 'invoice' from the backend enum values
        amount: parseFloat(formData.amount),
      };

      if (invoice?.id) {
        // Update existing invoice
        await updateTransaction(invoice.id, invoiceData);
      } else {
        // Create new invoice
        await createTransaction(invoiceData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomerChange = (customerId: string, customerData?: Partial<Customer>) => {
    setFormData({
      ...formData,
      customerId: customerId,
    });
    setSelectedCustomer(customerData || null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          <div className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm">
            <label htmlFor="customerId" className="block text-sm font-semibold text-gray-800 mb-3">
              Customer *
            </label>
            <CustomerSelector
              value={formData.customerId}
              onChange={handleCustomerChange}
              required
              placeholder="Search or create customer"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-800 mb-3">
              Invoice Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm">
            <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-800 mb-3">
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="credit">Credit</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm">
            <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-800 mb-3">
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              required
              value={formData.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-3">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter invoice description"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm">
            <label htmlFor="status" className="block text-sm font-semibold text-gray-800 mb-3">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : 'Save Invoice'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
