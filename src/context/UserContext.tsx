'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/models';

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    const local = localStorage.getItem('user');
    if (local) {
      setUser(JSON.parse(local));
      setLoading(false);
    } else {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const res = await fetch('/api/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}; 