import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserRole, type UserRole } from '../data/auth';
import type { Session, User } from '@supabase/supabase-js';
import type { Business } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  businessId: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
  setBusinessId: (id: string) => void;
  setOnboarded: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [businessId, setBusinessIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Check for existing session and determine role on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        getUserRole(currentSession.user.id).then(({ role, profile }) => {
          setUserRoleState(role);
          setBusinessIdState(role === 'business' && profile ? (profile as Business).id : null);
          setIsOnboarded(role !== null);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          getUserRole(newSession.user.id).then(({ role, profile }) => {
            setUserRoleState(role);
            setBusinessIdState(role === 'business' && profile ? (profile as Business).id : null);
            setIsOnboarded(role !== null);
          });
        } else {
          setUserRoleState(null);
          setBusinessIdState(null);
          setIsOnboarded(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setSession(null);
    setUserRoleState(null);
    setBusinessIdState(null);
    setIsOnboarded(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!session?.user) throw new Error('No user session');

    // Call the SECURITY DEFINER function that deletes the current user
    // Cascading FKs will remove all related data (businesses, bags, orders, etc.)
    const { error } = await supabase.rpc('delete_own_account');
    if (error) throw new Error(error.message);

    await supabase.auth.signOut();
    setSession(null);
    setUserRoleState(null);
    setBusinessIdState(null);
    setIsOnboarded(false);
  }, [session]);

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
  }, []);

  const setBusinessId = useCallback((id: string) => {
    setBusinessIdState(id);
  }, []);

  const setOnboarded = useCallback(() => {
    setIsOnboarded(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        userRole,
        businessId,
        isLoading,
        isOnboarded,
        signInWithOtp,
        verifyOtp,
        signOut,
        deleteAccount,
        setUserRole,
        setBusinessId,
        setOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
