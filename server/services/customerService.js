const { Customer, Transaction } = require('../database/models');
const { Op } = require('sequelize');

class CustomerService {
  async getAllCustomers() {
    try {
      return await Customer.findAll({
        include: [{
          model: Transaction,
          as: 'transactions',
        }],
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  async createCustomer(customerData) {
    try {
      return await Customer.create(customerData);
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  async updateCustomer(id, customerData) {
    try {
      const [updatedCount] = await Customer.update(customerData, {
        where: { id },
      });
      
      if (updatedCount === 0) {
        throw new Error('Customer not found');
      }
      
      return await Customer.findByPk(id);
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  async deleteCustomer(id) {
    try {
      const deletedCount = await Customer.destroy({
        where: { id },
      });
      
      if (deletedCount === 0) {
        throw new Error('Customer not found');
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }

  async searchCustomers(searchTerm) {
    try {
      return await Customer.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [{
          model: Transaction,
          as: 'transactions',
        }],
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error searching customers: ${error.message}`);
    }
  }

  async getCustomerById(id) {
    try {
      const customer = await Customer.findByPk(id, {
        include: [{
          model: Transaction,
          as: 'transactions',
        }],
      });
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      return customer;
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  async deleteMultipleCustomers(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Invalid customer IDs provided');
      }

      // Check if customers exist
      const customers = await Customer.findAll({
        where: { id: ids },
        attributes: ['id']
      });

      if (customers.length === 0) {
        throw new Error('No customers found with provided IDs');
      }

      // Delete customers (this will cascade delete their transactions due to foreign key constraints)
      const deletedCount = await Customer.destroy({
        where: { id: ids }
      });

      return { 
        success: true, 
        deletedCount,
        message: `Successfully deleted ${deletedCount} customer(s) and their associated transactions`
      };
    } catch (error) {
      throw new Error(`Error deleting multiple customers: ${error.message}`);
    }
  }

  async updateCustomerBalance(customerId) {
    try {
      const customer = await Customer.findByPk(customerId, {
        include: [{
          model: Transaction,
          as: 'transactions',
        }],
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const totalCredit = customer.transactions
        .filter(t => t.type === 'SALE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalPaid = customer.transactions
        .filter(t => t.type === 'PAYMENT')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const balance = totalCredit - totalPaid;

      await customer.update({
        totalCredit,
        totalPaid,
        balance,
      });

      return customer;
    } catch (error) {
      throw new Error(`Error updating customer balance: ${error.message}`);
    }
  }
}

module.exports = new CustomerService();