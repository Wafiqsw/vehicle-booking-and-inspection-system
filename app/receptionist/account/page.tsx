'use client';

import React, { useState } from 'react';
import { Sidebar, ManageAccountForm, UserAccountData } from '@/components';
import { receptionistNavLinks } from '@/constant';

export default function ReceptionistAccountPage() {
  // Mock user data - In production, this would come from Firebase Auth + Firestore
  const [userData, setUserData] = useState<UserAccountData>({
    id: 'RCP-001',
    firstName: 'Nurul',
    lastName: 'Aisyah',
    email: 'nurul.aisyah@company.com',
    phoneNumber: '+60176543210',
    role: 'Receptionist'
  });

  // Handle profile update
  const handleUpdateProfile = async (data: UserAccountData) => {
    try {
      // TODO: Implement Firebase Firestore update
      // await updateDoc(doc(db, 'users', userData.id), {
      //   firstName: data.firstName,
      //   lastName: data.lastName,
      //   phoneNumber: data.phoneNumber,
      //   updatedAt: serverTimestamp()
      // });

      // Update local state
      setUserData(data);

      console.log('Profile updated:', data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Handle password change
  const handleChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      // TODO: Implement Firebase Auth password change
      // const user = auth.currentUser;
      // if (user) {
      //   const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
      //   await reauthenticateWithCredential(user, credential);
      //   await updatePassword(user, data.newPassword);
      // }

      console.log('Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  };

  // Handle logout
  const handleLogout = () => {
    // TODO: Implement Firebase Auth logout
    // await signOut(auth);
    // router.push('/login');

    console.log('Logging out...');
    alert('Logout functionality will be implemented with Firebase Authentication');
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
