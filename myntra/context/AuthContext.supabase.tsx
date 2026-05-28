import { createContext, useContext, useEffect, useState } from "react";
import React from "react";
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    (async () => {
      try {
        console.log("🔐 Initializing Supabase auth...");
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
        } else if (initialSession) {
          console.log("✅ Session found:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          console.log("📭 No session found");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔔 Auth state changed: ${event}`);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log(`🔐 Login attempt for ${email}`);
      setLoading(true);

      const { session, user } = await signInWithEmail(email, password);

      if (!session || !user) {
        throw new Error("Login failed: No session returned");
      }

      console.log(`✅ Login successful for ${user.email}`);
      setSession(session);
      setUser(user);
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Signup = async (fullName: string, email: string, password: string) => {
    try {
      console.log(`📝 Signup attempt for ${email}`);
      setLoading(true);

      const { session, user } = await signUpWithEmail(email, password, fullName);

      if (!user) {
        throw new Error("Signup failed: No user returned");
      }

      console.log(`✅ Signup successful for ${user.email}`);
      setUser(user);
      
      // Note: Session might be null if email confirmation is required
      if (session) {
        setSession(session);
      }
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

      await supabaseSignOut();

      console.log(`✅ Logout successful`);
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user && !!session;

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
