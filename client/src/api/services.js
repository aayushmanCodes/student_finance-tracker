import api from './axios';

export const fetchDashboardData = async () => {
  // Promise.all ensures we fetch everything simultaneously, slashing load times.
  const [txRes, goalsRes, wlRes] = await Promise.all([
    api.get('/transactions'),
    api.get('/goals'),
    api.get('/wishlist')
  ]);
  
  return { 
    transactions: txRes.data || [], 
    goals: goalsRes.data || [], 
    wishlist: wlRes.data || [] 
  };
};

export const addTransaction = async (data) => {
  const res = await api.post('/transactions', data);
  return res.data;
};

export const deleteTransaction = async (id) => {
  const res = await api.delete(`/transactions/${id}`);
  return res.data;
};

export const addWishlistItem = async (data) => {
  const res = await api.post('/wishlist', data);
  return res.data;
};

export const deleteWishlistItem = async (id) => {
  const res = await api.delete(`/wishlist/${id}`);
  return res.data;
};

export const updateTransaction = async ({ id, data }) => {
  const res = await api.put(`/transactions/${id}`, data);
  return res.data;
};