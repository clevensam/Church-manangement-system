import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/supabaseService';

interface AuthContextType {
  session: boolean;
  profile: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session in localStorage
    const savedUser = localStorage.getItem('kanisa_user');
    if (savedUser) {
        try {
            setProfile(JSON.parse(savedUser));
        } catch (e) {
            localStorage.removeItem('kanisa_user');
        }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
      // Do not set global loading(true) here. 
      // It causes App.tsx to unmount the Login component, losing form state and error messages.
      // The Login component handles its own loading UI.
      const user = await api.auth.login(email, pass);
      setProfile(user);
      localStorage.setItem('kanisa_user', JSON.stringify(user));
  };

  const signOut = async () => {
    localStorage.removeItem('kanisa_user');
    setProfile(null);
  };

  const refreshProfile = async () => {
      // In this simple model, we just re-sync from localStorage or could fetch from DB if needed
      // For now, assume state is source of truth or re-fetch from DB if we had a specific endpoint
      if (profile?.id) {
          // Optional: Fetch fresh data from DB? 
          // For simplicity in this demo, we assume local state is valid or update manually
          const users = await api.admin.getAllUsers();
          const me = users.find(u => u.id === profile.id);
          if (me) {
              setProfile(me);
              localStorage.setItem('kanisa_user', JSON.stringify(me));
          }
      }
  }

  return (
    <AuthContext.Provider value={{ session: !!profile, profile, loading, login, signOut, refreshProfile }}>
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