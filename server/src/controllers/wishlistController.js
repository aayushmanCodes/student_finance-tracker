const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
};

const addWishlistItem = async (req, res, next) => {
  try {
    const { name, price, emoji } = req.body;
    const item = await Wishlist.create({ user: req.user.id, name, price, emoji });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

const deleteWishlistItem = async (req, res, next) => {
  try {
    await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { getWishlist, addWishlistItem, deleteWishlistItem };