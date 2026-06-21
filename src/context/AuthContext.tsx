import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser, UserRole } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from("users")
        .select("role, name, email, phone, society_id, flat_no, societies(slug, name, address, subscription_plan)")
        .eq("id", userId)
        .maybeSingle();
        
      if (error || !data) {
        throw new Error("User profile not found");
      }

      setUser({
        id: userId,
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        role: data.role as UserRole,
        societyId: data.society_id,
        societySlug: data.societies?.slug,
        societyName: data.societies?.name,
        societyAddress: data.societies?.address,
        subscriptionPlan: data.societies?.subscription_plan,
        flat: data.flat_no,
        avatar: data.name[0].toUpperCase(),
      });
    } catch (err: any) {
      // Fallback for Super Admin if RLS blocks the fetch
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin") {
        setUser({
          id: userId,
          name: "Super Admin",
          email: user.email ?? "",
          role: "admin",
          societyId: "",
        });
      } else {
        console.error(err);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
