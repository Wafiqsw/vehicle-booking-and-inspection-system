'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/index';
import { getDocument } from '@/firebase/firestore';

interface UseAuthOptions {
  redirectTo?: string;
  requiredRole?: 'Staff' | 'Admin' | 'Receptionist' | Array<'Staff' | 'Admin' | 'Receptionist'>;
  skipRedirect?: boolean; // Skip redirect during sensitive operations
}

interface CachedUserData {
  uid: string;
  role: string;
  timestamp: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useAuth = (options: UseAuthOptions = {}) => {
  const { redirectTo = '/', requiredRole, skipRedirect = false } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Check if we should skip redirect (e.g., during user creation)
        const shouldSkipRedirect = sessionStorage.getItem('skipAuthRedirect') === 'true';

        // User is not logged in, clear cache and redirect (unless skipRedirect is true)
        localStorage.removeItem('userRoleCache');
        setLoading(false);

        if (!shouldSkipRedirect) {
          // Add small delay to allow re-authentication to complete
          setTimeout(() => {
            // Double-check if user is still null after delay
            if (!auth.currentUser) {
              router.push(redirectTo);
            }
          }, 1000);
        }
        return;
      }

      try {
        // Check cache first
        const cachedData = localStorage.getItem('userRoleCache');
        let role: string;

        if (cachedData) {
          const parsed: CachedUserData = JSON.parse(cachedData);
          const now = Date.now();

          // Use cached data if it's still valid and for the same user
          if (parsed.uid === currentUser.uid && (now - parsed.timestamp) < CACHE_DURATION) {
            role = parsed.role;
          } else {
            // Cache expired or different user, fetch from Firestore
            const userDoc = await getDocument('users', currentUser.uid);

            if (!userDoc) {
              localStorage.removeItem('userRoleCache');
              setLoading(false);
              router.push(redirectTo);
              return;
            }

            role = userDoc.role as string;

            // Update cache
            const newCache: CachedUserData = {
              uid: currentUser.uid,
              role: role,
              timestamp: Date.now()
            };
            localStorage.setItem('userRoleCache', JSON.stringify(newCache));
          }
        } else {
          // No cache, fetch from Firestore
          const userDoc = await getDocument('users', currentUser.uid);

          if (!userDoc) {
            localStorage.removeItem('userRoleCache');
            setLoading(false);
            router.push(redirectTo);
            return;
          }

          role = userDoc.role as string;

          // Create cache
          const newCache: CachedUserData = {
            uid: currentUser.uid,
            role: role,
            timestamp: Date.now()
          };
          localStorage.setItem('userRoleCache', JSON.stringify(newCache));
        }

        // Check if user has required role
        if (requiredRole) {
          const hasRequiredRole = Array.isArray(requiredRole)
            ? requiredRole.includes(role as 'Staff' | 'Admin' | 'Receptionist')
            : role === requiredRole;

          if (!hasRequiredRole) {
            // User doesn't have the required role, redirect
            setLoading(false);
            router.push(redirectTo);
            return;
          }
        }

        // User is authenticated and has correct role
        setUser(currentUser);
        setUserRole(role);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('userRoleCache');
        setLoading(false);
        router.push(redirectTo);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router, redirectTo, requiredRole, skipRedirect]);

  return { user, userRole, loading };
};

export default useAuth;
