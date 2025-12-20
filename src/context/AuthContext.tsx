import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Booking } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addBooking: (booking: Booking) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production, this would call your MySQL backend
    if (email === 'admin@tixwix.com' && password === 'admin123') {
      setUser({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@tixwix.com',
        role: 'admin',
        bookings: [],
        monthlyBookingCount: 0,
      });
      return true;
    }
    
    // Regular user login
    if (email && password) {
      setUser({
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email,
        role: 'user',
        bookings: [],
        monthlyBookingCount: Math.floor(Math.random() * 5),
      });
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock registration
    if (name && email && password) {
      setUser({
        id: 'user-' + Date.now(),
        name,
        email,
        role: 'user',
        bookings: [],
        monthlyBookingCount: 0,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addBooking = (booking: Booking) => {
    if (user) {
      setUser({
        ...user,
        bookings: [...user.bookings, booking],
        monthlyBookingCount: user.monthlyBookingCount + 1,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        addBooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
