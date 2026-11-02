/**
 * AuthContext.jsx — Unified Authentication & Role Authorization Context
 *
 * Supports dual-mode operation:
 *  1. LIVE BACKEND MODE: Authenticates against Express/MongoDB API with JWT tokens.
 *  2. DEMO PROTOTYPE MODE: Fallback mock authentication for presentations & offline preview.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLE_HOME_ROUTES, getAllUsers, saveCustomUser, saveCustomPatient, getAllPatients } from '../data/demoData';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('hms_user') || localStorage.getItem('hms_user') ||
                     sessionStorage.getItem('hms_demo_user') || localStorage.getItem('hms_demo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [backendChecking, setBackendChecking] = useState(true);

  // Check backend server health on initial mount
  useEffect(() => {
    let isMounted = true;
    authApi.checkHealth()
      .then(() => {
        if (isMounted) setIsLiveBackend(true);
      })
      .catch(() => {
        if (isMounted) setIsLiveBackend(false);
      })
      .finally(() => {
        if (isMounted) setBackendChecking(false);
      });

    return () => { isMounted = false; };
  }, []);

  /**
   * Unified Login: Tries real Express JWT API first; seamlessly falls back to demo mode
   * so demo accounts work reliably even if the database has not been seeded yet.
   */
  const login = useCallback(async (identifier, password, rememberMe = false) => {
    const ident = identifier.trim();
    const identLower = ident.toLowerCase();

    // 1. Attempt Real Backend Authentication if reachable
    try {
      const response = await authApi.login({ email: ident, password });
      if (response && response.success && response.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('hms_jwt_token', response.token);
        storage.setItem('hms_user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        setIsLiveBackend(true);

        return {
          success: true,
          user: response.user,
          isBackend: true,
          redirectTo: ROLE_HOME_ROUTES[response.user.role] ?? '/',
        };
      }
    } catch (err) {
      // Backend offline, timed out, or unseeded — gracefully fall through to demo users
    }

    // 2. Demo User Fallback (covers pre-configured demo roles and locally registered users)
    const all = getAllUsers();
    const found = all.find(
      (u) =>
        (u.email?.toLowerCase() === identLower ||
         (u.patientId && u.patientId.toLowerCase() === identLower) ||
         (u.uhid && u.uhid.toLowerCase() === identLower)) &&
        u.password === password
    );

    if (found) {
      const { password: _pw, ...safeUser } = found;
      setCurrentUser(safeUser);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('hms_demo_user', JSON.stringify(safeUser));

      return {
        success: true,
        user: safeUser,
        isBackend: false,
        redirectTo: ROLE_HOME_ROUTES[safeUser.role] ?? '/',
      };
    }

    return {
      success: false,
      error: 'Invalid email/UHID or password.',
    };
  }, []);

  /**
   * Register a new patient
   */
  const registerPatient = useCallback(async (data, autoLogin = false) => {
    const allP = getAllPatients();
    const nextSeq = allP.length + 1;
    const patientId = `P-${String(nextSeq).padStart(3, '0')}`;
    const uhid = `UHID-2024-${String(1000 + nextSeq)}`;

    const nameInitials = data.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newUser = {
      id: `u-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'patient',
      avatar: nameInitials || 'PT',
      patientId: patientId,
      uhid: uhid,
      phone: data.phone,
      bloodGroup: data.bloodGroup || 'O+',
      gender: data.gender || 'Not specified',
      dob: data.dob,
      address: data.address,
      emergencyContact: data.emergencyContact,
      registeredAt: new Date().toISOString().split('T')[0],
    };

    const newPatient = {
      id: patientId,
      uhid: uhid,
      name: data.name,
      age: data.age || (data.dob ? Math.max(1, new Date().getFullYear() - new Date(data.dob).getFullYear()) : 30),
      gender: data.gender || 'Not specified',
      blood: data.bloodGroup || 'O+',
      phone: data.phone,
      email: data.email,
      address: data.address ? `${data.address}, ${data.city || ''} ${data.pincode || ''}`.trim() : 'Registered Online',
      status: 'active',
      registered: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      emergencyContactName: data.emergencyName,
      emergencyContactPhone: data.emergencyPhone,
      allergies: data.allergies || 'None reported',
      conditions: data.conditions || 'None reported',
    };

    saveCustomUser(newUser);
    saveCustomPatient(newPatient);

    if (autoLogin) {
      const { password: _pw, ...safeUser } = newUser;
      setCurrentUser(safeUser);
      sessionStorage.setItem('hms_demo_user', JSON.stringify(safeUser));
    }

    return {
      success: true,
      patientId,
      uhid,
      user: newUser,
      patient: newPatient,
    };
  }, []);

  /**
   * Universal Logout
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Safe ignore on network error
    }
    setCurrentUser(null);
    localStorage.removeItem('hms_jwt_token');
    sessionStorage.removeItem('hms_jwt_token');
    localStorage.removeItem('hms_user');
    sessionStorage.removeItem('hms_user');
    localStorage.removeItem('hms_demo_user');
    sessionStorage.removeItem('hms_demo_user');
  }, []);

  /**
   * Check user role permission
   */
  const hasRole = useCallback(
    (roles) => {
      if (!currentUser) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(currentUser.role);
    },
    [currentUser]
  );

  /**
   * Switch role in demo mode
   */
  const switchRole = useCallback((role) => {
    const all = getAllUsers();
    const found = all.find((u) => u.role === role);
    if (found) {
      const { password: _pw, ...safeUser } = found;
      setCurrentUser(safeUser);
      sessionStorage.setItem('hms_demo_user', JSON.stringify(safeUser));
      return ROLE_HOME_ROUTES[safeUser.role] ?? '/';
    }
    return null;
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    registerPatient,
    logout,
    switchRole,
    hasRole,
    isLiveBackend,
    backendChecking,
    DEMO_MODE: !isLiveBackend,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
