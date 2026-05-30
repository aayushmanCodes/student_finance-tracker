const router = require('express').Router();
const { getWishlist, addWishlistItem, deleteWishlistItem } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth'); // Ensure this path is correct for your auth middleware

router.use(protect);
router.get('/', getWishlist);
router.post('/', addWishlistItem);
router.delete('/:id', deleteWishlistItem);

module.exports = router;