import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTransactions, useCustomers } from '../hooks/useElectron';
import type { Transaction, Customer } from '../types';
import CustomerSelector from './CustomerSelector';

interface PaymentFormProps {
  payment?: Transaction;
  onClose: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onClose }) => {
  const { createTransaction } = useTransactions();
  const { customers } = useCustomers();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: payment?.customerId || '',
    amount: payment?.amount?.toString() || '',
    description: payment?.description || '',
    paymentMethod: payment?.paymentMethod || 'CASH',
    invoiceId: payment?.relatedTransactionId || ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const paymentData = {
        ...formData,
        type: 'payment', // Using 'payment' from the backend enum values
        amount: parseFloat(formData.amount),
        status: 'completed', // Using 'completed' from the backend enum values
      };
      
      await createTransaction(paymentData);
      onClose();
    } catch (error) {
      console.error('Error saving payment:', error);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {payment ? 'Edit Payment' : 'Record New Payment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <CustomerSelector
              value={formData.customerId}
              onChange={handleCustomerChange}
              required
              placeholder="Search or create customer"
            />
          </div>

          <div>
            <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-2">
              Related Invoice (Optional)
            </label>
            <input
              type="text"
              id="invoiceId"
              name="invoiceId"
              value={formData.invoiceId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter invoice ID"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount *
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CASH">Cash</option>
              <option value="CREDIT">Credit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter payment description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : 'Save Payment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;