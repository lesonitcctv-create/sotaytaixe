import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Cửa sổ đăng nhập bị chặn. Vui lòng tắt chặn pop-up trong cài đặt trình duyệt và thử lại.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Bạn đã đóng cửa sổ đăng nhập. Vui lòng thử lại.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Tên miền chưa được ủy quyền. Vui lòng liên hệ quản trị viên để thêm tên miền này vào Firebase Console.");
      } else {
        setError("Đăng nhập thất bại: " + (err.message || "Lỗi không xác định"));
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setError(null);
    } catch (err: any) {
      console.error("Logout failed", err);
      setError("Đăng xuất thất bại: " + (err.message || "Lỗi không xác định"));
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
