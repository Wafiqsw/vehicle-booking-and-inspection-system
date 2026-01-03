'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, ManageAccountForm, PasswordChangeData } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { useRouter } from 'next/navigation';
import { logOut, changePassword, getCurrentUser } from '@/firebase/auth';
import { getDocument, updateDocument } from '@/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function ReceptionistAccountPage() {
  const router = useRouter();

  const { user: authUser, loading } = useAuth({
    redirectTo: '/receptionist/auth',
    requiredRole: ['Receptionist', 'Admin']
  });

  const [userData, setUserData] = useState<User | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return;

      try {
        const userDoc = await getDocument('users', authUser.uid);

        if (userDoc) {
          setUserData({
            id: userDoc.id as string,
            email: userDoc.email as string,
            tempPasswordStatus: userDoc.tempPasswordStatus as boolean,
            firstName: userDoc.firstName as string,
            lastName: userDoc.lastName as string,
            phoneNumber: userDoc.phoneNumber as string,
            role: userDoc.role as 'Staff' | 'Admin' | 'Receptionist',
            createdAt: userDoc.createdAt,
            updatedAt: userDoc.updatedAt
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Error loading user data. Please refresh the page.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  if (loading || !authUser || isLoadingData || !userData) {
    return null;
  }

  // Handle profile update
  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!authUser) return;

    try {
      // Update Firestore
      await updateDocument('users', authUser.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber
      });

      // Update local state
      setUserData(prev => prev ? { ...prev, ...data } : null);

      // Update cache
      const cachedData = localStorage.getItem('userRoleCache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        parsed.timestamp = Date.now(); // Refresh cache timestamp
        localStorage.setItem('userRoleCache', JSON.stringify(parsed));
      }

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Handle password change
  const handleChangePassword = async (data: PasswordChangeData) => {
    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.email) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Change password
      await changePassword(currentUser, data.newPassword);

      // Update tempPasswordStatus to false in Firestore
      if (authUser) {
        await updateDocument('users', authUser.uid, {
          tempPasswordStatus: false
        });

        // Update local state
        setUserData(prev => prev ? { ...prev, tempPasswordStatus: false } : null);
      }

      console.log('Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak');
      }

      throw new Error(error.message || 'Failed to change password');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile and security settings</p>
        </div>

        {/* Content */}
        <ManageAccountForm
          userData={userData}
          onUpdateProfile={handleUpdateProfile}
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
        />
      </main>
    </div>
  );
}
