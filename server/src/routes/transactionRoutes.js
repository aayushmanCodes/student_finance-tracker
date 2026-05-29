const router = require('express').Router();
const { addTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);  // all transaction routes require login

router.post('/',     addTransaction);
router.get('/',      getTransactions);
router.delete('/:id', deleteTransaction);

module.exports = router;