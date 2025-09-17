const { NotificationRule } = require('../database/models');
const { Op } = require('sequelize');

class NotificationService {
  async getAllRules() {
    try {
      return await NotificationRule.findAll({
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error fetching notification rules: ${error.message}`);
    }
  }

  async createRule(ruleData) {
    try {
      return await NotificationRule.create(ruleData);
    } catch (error) {
      throw new Error(`Error creating notification rule: ${error.message}`);
    }
  }

  async updateRule(id, ruleData) {
    try {
      const [updatedCount] = await NotificationRule.update(ruleData, {
        where: { id },
      });
      
      if (updatedCount === 0) {
        throw new Error('Notification rule not found');
      }
      
      return await NotificationRule.findByPk(id);
    } catch (error) {
      throw new Error(`Error updating notification rule: ${error.message}`);
    }
  }

  async deleteRule(id) {
    try {
      const deletedCount = await NotificationRule.destroy({
        where: { id },
      });
      
      if (deletedCount === 0) {
        throw new Error('Notification rule not found');
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting notification rule: ${error.message}`);
    }
  }

  async testRule(ruleId) {
    try {
      const rule = await NotificationRule.findByPk(ruleId);
      
      if (!rule) {
        throw new Error('Notification rule not found');
      }

      // In web version, we log the test instead of showing desktop notification
      console.log(`[TEST NOTIFICATION] ${rule.message.title}: ${rule.message.body}`);
      
      return { 
        success: true, 
        message: 'Test notification logged to server console!' 
      };
    } catch (error) {
      throw new Error(`Error testing notification rule: ${error.message}`);
    }
  }

  async getActiveRules() {
    try {
      return await NotificationRule.findAll({
        where: { enabled: true },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error fetching active notification rules: ${error.message}`);
    }
  }

  async executeRule(rule, customers, transactions) {
    try {
      let matchingCustomers = [];

      // Apply rule conditions
      if (rule.conditions.daysOverdue) {
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - rule.conditions.daysOverdue);
        
        matchingCustomers = customers.filter(customer => {
          return customer.transactions?.some(t => 
            t.dueDate && 
            new Date(t.dueDate) <= overdueDate && 
            t.status !== 'PAID'
          );
        });
      }

      if (rule.conditions.balanceThreshold) {
        matchingCustomers = matchingCustomers.filter(customer => 
          parseFloat(customer.balance) >= rule.conditions.balanceThreshold
        );
      }

      if (matchingCustomers.length > 0 && rule.actions.notification) {
        // In web version, log notifications instead of showing desktop notifications
        console.log(`[NOTIFICATION] ${rule.message.title}: ${rule.message.body}`);
        console.log(`Affected customers: ${matchingCustomers.length}`);
      }

      // Update last run time
      await rule.update({ lastRun: new Date() });

      return { success: true, matchingCustomers: matchingCustomers.length };
    } catch (error) {
      throw new Error(`Error executing notification rule: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();