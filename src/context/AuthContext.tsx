import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Booking } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  bookings: Booking[];
  monthlyBookingCount: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addBooking: (booking: Booking) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and role from database
  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      }

      // Fetch user bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', supabaseUser.id);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      const userRole = roleData?.role as 'user' | 'admin' || 'user';

      return {
        id: supabaseUser.id,
        name: profile.name || 'User',
        email: profile.email,
        phone: profile.phone || undefined,
        role: userRole,
        bookings: bookings?.map(b => ({
          id: b.id,
          userId: b.user_id,
          type: b.type as 'movie' | 'concert',
          showId: b.show_id,
          quantity: b.quantity || undefined,
          totalPrice: Number(b.total_price),
          promoCode: b.promo_code || undefined,
          discount: Number(b.discount) || 0,
          finalPrice: Number(b.final_price),
          bookingDate: b.booking_date || new Date().toISOString(),
          status: b.status as 'confirmed' | 'cancelled' | 'used',
        })) || [],
        monthlyBookingCount: profile.monthly_booking_count || 0,
      };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          // Use setTimeout to prevent potential deadlock with Supabase
          setTimeout(async () => {
            const userData = await fetchUserData(session.user);
            setUser(userData);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        setUser(userData);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function using Supabase Auth
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        const userData = await fetchUserData(data.user);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  // Register function using Supabase Auth
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // This is passed to the handle_new_user trigger
          },
        },
      });

      if (error) {
        console.error('Registration error:', error.message);
        return false;
      }

      if (data.user) {
        // Profile is created automatically by the handle_new_user trigger
        const userData = await fetchUserData(data.user);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration exception:', error);
      return false;
    }
  };

  // Logout function using Supabase Auth
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout exception:', error);
    }
  };

  // Add booking to user's bookings
  const addBooking = (booking: Booking) => {
    if (user) {
      const newCount = user.monthlyBookingCount >= 4 ? 0 : user.monthlyBookingCount + 1;
      setUser({
        ...user,
        bookings: [...user.bookings, booking],
        monthlyBookingCount: newCount,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
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
