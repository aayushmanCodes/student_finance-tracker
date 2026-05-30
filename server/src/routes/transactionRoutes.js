const router = require('express').Router();
const { addTransaction, getTransactions, deleteTransaction, updateTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);  // all transaction routes require login

router.post('/',     addTransaction);
router.get('/',      getTransactions);
router.delete('/:id', deleteTransaction);
router.put('/:id', updateTransaction);

module.exports = router;