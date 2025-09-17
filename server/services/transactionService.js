const { Transaction, Customer } = require('../database/models');
const customerService = require('./customerService');

class TransactionService {
  async getAllTransactions() {
    try {
      return await Transaction.findAll({
        include: [{
          model: Customer,
          as: 'customer',
          attributes: ['name', 'phone'],
        }],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  async getTransactionsByCustomer(customerId) {
    try {
      return await Transaction.findAll({
        where: { customerId },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error fetching customer transactions: ${error.message}`);
    }
  }

  async createTransaction(transactionData) {
    try {
      const transaction = await Transaction.create({
        ...transactionData,
        remainingAmount: transactionData.paymentMethod === 'CREDIT' 
          ? transactionData.amount 
          : 0,
        status: transactionData.paymentMethod === 'CASH' 
          ? 'PAID' 
          : 'UNPAID',
      });

      // Update customer balance
      await customerService.updateCustomerBalance(transactionData.customerId);

      return transaction;
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  async makePayment(transactionId, amount) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const newPaidAmount = parseFloat(transaction.paidAmount) + parseFloat(amount);
      const remainingAmount = parseFloat(transaction.amount) - newPaidAmount;
      
      let status = 'PARTIAL';
      if (remainingAmount <= 0) {
        status = 'PAID';
      }

      await transaction.update({
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, remainingAmount),
        status,
      });

      // Update customer balance
      await customerService.updateCustomerBalance(transaction.customerId);

      return transaction;
    } catch (error) {
      throw new Error(`Error processing payment: ${error.message}`);
    }
  }

  async getOverdueTransactions() {
    try {
      const today = new Date();
      return await Transaction.findAll({
        where: {
          dueDate: {
            [Op.lt]: today,
          },
          status: ['UNPAID', 'PARTIAL'],
        },
        include: [{
          model: Customer,
          as: 'customer',
          attributes: ['name', 'phone'],
        }],
      });
    } catch (error) {
      throw new Error(`Error fetching overdue transactions: ${error.message}`);
    }
  }
}

module.exports = new TransactionService();