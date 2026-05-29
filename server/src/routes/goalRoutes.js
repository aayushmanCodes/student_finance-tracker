const router = require('express').Router();
const { setGoal, getGoals } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', setGoal);
router.get('/',  getGoals);

module.exports = router;