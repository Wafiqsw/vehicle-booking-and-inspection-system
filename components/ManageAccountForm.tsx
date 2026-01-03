'use client';

import React, { useState, useEffect } from 'react';
import { MdPerson, MdLock, MdSave, MdLogout } from 'react-icons/md';
import { User } from '@/types';
import { Button } from './Button';

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ManageAccountFormProps {
  userData: User;
  onUpdateProfile: (data: Partial<User>) => Promise<void>;
  onChangePassword: (data: PasswordChangeData) => Promise<void>;
  onLogout?: () => void;
}

export const ManageAccountForm: React.FC<ManageAccountFormProps> = ({
  userData,
  onUpdateProfile,
  onChangePassword,
  onLogout
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPasswordLoading, setIsChangingPasswordLoading] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState<User>(userData);

  // Update profile data when userData changes
  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  // Password form data
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      await onUpdateProfile(profileData);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters!');
      return;
    }

    setIsChangingPasswordLoading(true);

    try {
      await onChangePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      alert('Password changed successfully!');
    } catch (error: any) {
      alert('Error changing password: ' + error.message);
    } finally {
      setIsChangingPasswordLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileData(userData);
    setIsEditingProfile(false);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdPerson className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>
            </div>
            {!isEditingProfile && (
              <Button
                onClick={() => setIsEditingProfile(true)}
                variant="primary"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {!isEditingProfile ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <p className="text-base text-gray-900">{userData.firstName || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <p className="text-base text-gray-900">{userData.lastName || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                <p className="text-base text-gray-900">{userData.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                <p className="text-base text-gray-900">{userData.phoneNumber || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  userData.role === 'Admin'
                    ? 'bg-red-100 text-red-800'
                    : userData.role === 'Receptionist'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userData.role}
                </span>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName || ''}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName || ''}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={profileData.phoneNumber || ''}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleCancelProfile}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={MdSave}
                  loading={isUpdatingProfile}
                  fullWidth
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MdLock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your password regularly for security</p>
              </div>
            </div>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="success"
              >
                Change Password
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {!isChangingPassword ? (
            <div className="text-center py-8 text-gray-500">
              <MdLock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Your password is secure. Click "Change Password" to update it.</p>
              <p className="text-xs mt-2">Last changed: Recently</p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                  />
                </div>

                {passwordData.newPassword && passwordData.confirmPassword &&
                 passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match!</p>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleCancelPassword}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  icon={MdLock}
                  loading={isChangingPasswordLoading}
                  fullWidth
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-blue-600 text-sm font-bold">i</span>
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Account Security Tips</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Use a strong, unique password that you don't use elsewhere</li>
              <li>Change your password regularly (every 3-6 months recommended)</li>
              <li>Never share your password with anyone</li>
              <li>If you suspect unauthorized access, change your password immediately</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      {onLogout && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Logout</h2>
                <p className="text-sm text-gray-500 mt-1">Sign out of your account</p>
              </div>
              <Button
                onClick={onLogout}
                variant="danger"
                icon={MdLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccountForm;
