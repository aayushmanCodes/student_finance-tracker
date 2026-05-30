const Transaction = require('../models/Transaction');
const User = require('../models/User');

// POST /api/transactions
const addTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, note, date } = req.body;
    const tx = await Transaction.create({ user: req.user.id, type, amount, category, note, date });

    // Streak logic
    const user = await User.findById(req.user.id);
    const today = new Date().toDateString();
    const last  = user.lastLogDate ? new Date(user.lastLogDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (last !== today) {
      user.streak = last === yesterday ? user.streak + 1 : 1;
      user.lastLogDate = new Date();
      user.xp += 10;
      await user.save();
    }

    res.status(201).json({ tx, streak: user.streak, xp: user.xp });
  } catch (err) { next(err); }
};

// GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(txs);
  } catch (err) { next(err); }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Transaction deleted' });
  } catch (err) { next(err); }
};

const updateTransaction = async (req, res, next) => {
  try {
    const updatedTx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body, 
      {new: true
      }
    );
    if (!updatedTx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updatedTx);
  } catch (err) { 
    next(err); 
  }
};


module.exports = { addTransaction, getTransactions, deleteTransaction, updateTransaction };