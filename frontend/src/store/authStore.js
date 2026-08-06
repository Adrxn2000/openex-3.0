
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: null,
  username: null,

  login: (token, username) => set({ token, username }),
  logout: () => set({ token: null, username: null }),
}));

export default useAuthStore;