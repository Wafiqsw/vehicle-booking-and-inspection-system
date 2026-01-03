// Firebase Authentication Methods
// Reusable methods for user authentication

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from './index';
import { setDocument } from './firestore';

// ==================== SIGN IN / SIGN UP ====================

/**
 * Sign in with email and password
 * @param email - User email
 * @param password - User password
 * @returns UserCredential
 */
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Create a new user account (for self-registration)
 * @param email - User email
 * @param password - User password
 * @param displayName - User display name (optional)
 * @returns UserCredential
 */
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Create a user account by admin (creates account without signing in as that user)
 * NOTE: This uses a workaround since Firebase doesn't allow creating users without signing them in
 * on the client side. For production, consider using Firebase Cloud Functions with Admin SDK.
 *
 * @param email - New user email
 * @param password - New user password (temporary password)
 * @param firstName - User first name
 * @param lastName - User last name
 * @param phoneNumber - User phone number
 * @param role - User role (Staff, Admin, Receptionist)
 * @param adminEmail - Current admin's email for re-authentication
 * @param adminPassword - Current admin's password for re-authentication
 * @returns User ID and temporary password
 */
export const createUserByAdmin = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: 'Staff' | 'Admin' | 'Receptionist',
  adminEmail: string,
  adminPassword: string
): Promise<{ userId: string; tempPassword: string }> => {
  try {
    // Store current user
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('Admin must be logged in to create users');
    }

    // Store admin email for re-authentication
    const adminEmailToRestore = currentUser.email;

    // Create the new user (this will sign them in automatically)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Update the new user's profile
    await updateProfile(newUser, { displayName: `${firstName} ${lastName}` });

    // Store user data in Firestore with temporary password
    await setDocument('users', newUser.uid, {
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
      password, // Store the temporary password (will be deleted when user changes it)
    });

    const userId = newUser.uid;

    // Sign out the new user
    await signOut(auth);

    // Re-authenticate the admin to restore their session
    if (adminEmailToRestore) {
      const credential = EmailAuthProvider.credential(adminEmail, adminPassword);
      const adminUserCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      // Wait a bit for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify we're back as admin
      if (adminUserCredential.user.email !== adminEmailToRestore) {
        throw new Error('Failed to restore admin session');
      }
    }

    return { userId, tempPassword: password };
  } catch (error: any) {
    console.error('Error creating user by admin:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign out current user
 */
export const logOut = async (): Promise<void> => {
  try {
    // Clear the cached user role data
    localStorage.removeItem('userRoleCache');

    // Sign out from Firebase
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Create user by admin using Cloud Function (Server-side)
 * This is the PROPER way - no redirect issues!
 */
interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'Staff' | 'Admin' | 'Receptionist';
}

interface CreateUserResponse {
  success: boolean;
  userId: string;
  tempPassword: string;
}

export const createUserByAdminCloud = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: 'Staff' | 'Admin' | 'Receptionist'
): Promise<{ userId: string; tempPassword: string }> => {
  try {
    const functions = getFunctions();
    const createUser = httpsCallable<CreateUserData, CreateUserResponse>(
      functions,
      'createUser'
    );

    const result = await createUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
    });

    if (!result.data.success) {
      throw new Error('Failed to create user');
    }

    return {
      userId: result.data.userId,
      tempPassword: result.data.tempPassword,
    };
  } catch (error: any) {
    console.error('Error calling createUser function:', error);

    // Handle specific error codes
    if (error.code === 'functions/already-exists') {
      throw new Error('Email address is already in use');
    } else if (error.code === 'functions/permission-denied') {
      throw new Error('Only admins can create users');
    } else if (error.code === 'functions/unauthenticated') {
      throw new Error('You must be logged in to create users');
    }

    throw new Error(error.message || 'Failed to create user');
  }
};

// ==================== PASSWORD MANAGEMENT ====================

/**
 * Update user password (must be authenticated)
 * @param user - Current user
 * @param newPassword - New password
 */
export const changePassword = async (
  user: User,
  newPassword: string
): Promise<void> => {
  try {
    // Update password in Firebase Auth
    await updatePassword(user, newPassword);

    // Delete password field from Firestore (user no longer using temp password)
    const { updateDocument } = await import('./firestore');
    await updateDocument('users', user.uid, {
      password: null // Remove password field
    });
  } catch (error: any) {
    console.error('Error updating password:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Send password reset email
 * @param email - User email address
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// ==================== PROFILE MANAGEMENT ====================

/**
 * Update user profile
 * @param user - Current user
 * @param displayName - New display name
 * @param photoURL - New photo URL (optional)
 */
export const updateUserProfile = async (
  user: User,
  displayName: string,
  photoURL?: string
): Promise<void> => {
  try {
    await updateProfile(user, {
      displayName,
      ...(photoURL && { photoURL })
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns Current user or null
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// ==================== ERROR HANDLING ====================

/**
 * Convert Firebase auth error codes to user-friendly messages
 * @param errorCode - Firebase error code
 * @returns User-friendly error message
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to perform this action.';
    default:
      return 'An error occurred. Please try again.';
  }
};
