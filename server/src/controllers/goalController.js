const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// POST /api/goals
const setGoal = async (req, res, next) => {
  try {
    const { category, limit, month } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { user: req.user.id, category, month },
      { limit },
      { upsert: true, new: true }
    );
    res.json(goal);
  } catch (err) { next(err); }
};

// GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    const enriched = await Promise.all(goals.map(async (goal) => {
      const [year, month] = goal.month.split('-');
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 1);
      const result = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(req.user.id),  // ← Fix 1: cast to ObjectId
            category: goal.category,
            type: 'expense',
            date: { $gte: start, $lt: end }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const spent = result[0]?.total || 0;
      return { ...goal.toObject(), spent, alert: spent >= goal.limit };
    }));

    res.json(enriched);
  } catch (err) { next(err); }
};

module.exports = { setGoal, getGoals };