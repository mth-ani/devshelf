
import {
  createContext,
  useContext,
  useState,
} from 'react';

import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devshelf_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('devshelf_token')
  );

  const isAuthenticated = Boolean(token);

  async function login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const data = response.data;
    const newToken = data.token;

    if (!newToken) {
      throw new Error('The server did not return a login token.');
    }

    const loggedInUser = {
      id: data.id,
      userName: data.userName,
      email: data.email ?? email,
    };

    localStorage.setItem('devshelf_token', newToken);
    localStorage.setItem(
      'devshelf_user',
      JSON.stringify(loggedInUser)
    );

    setToken(newToken);
    setUser(loggedInUser);

    return loggedInUser;
  }

  async function register(userName, email, password) {
    const response = await api.post('/auth/register', {
      userName,
      email,
      password,
    });

    return response.data;
  }

  function logout() {
    localStorage.removeItem('devshelf_token');
    localStorage.removeItem('devshelf_user');

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
