import { createContext, useContext, useEffect, useState } from "react";
import React from "react";
import { supabase } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";

export type BackendUser = {
  id: string; // Changed from _id to id to match Supabase UUID
  fullName: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: BackendUser | null;
  session: Session | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync user profile from Supabase
  const syncProfile = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      
      if (error) {
        // If profile doesn't exist yet, construct basic user
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          fullName: authUser.user_metadata?.full_name || "User",
        });
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        fullName: data.full_name,
      });
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      syncProfile(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      syncProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log(`🔐 Login attempt for ${email}`);
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
      console.log(`✅ Login successful for ${email}`);
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Signup = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      console.log(`📝 Signup attempt for ${email}`);
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      console.log(`✅ Signup successful for ${email}`);
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log(`👋 Logging out...`);
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      console.log(`✅ Logout successful`);
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        Signup,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
