export const auth = {
  setToken: (token: string) => localStorage.setItem('token', token),
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setOrganizerId: (id: string) => localStorage.setItem('organizerId', id),
  getOrganizerId: () => typeof window !== 'undefined' ? localStorage.getItem('organizerId') : null,
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('organizerId');
  },
  isLoggedIn: () => !!(typeof window !== 'undefined' && localStorage.getItem('token'))
};
