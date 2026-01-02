import React from 'react';

export interface StaffFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'Staff' | 'Admin' | 'Receptionist';
  tempPassword?: string; // Temporary password - visible until user changes it
  hasChangedPassword?: boolean; // Track if user has changed their initial password
  sendPasswordReset?: boolean; // For edit mode
}

interface StaffFormProps {
  formData: Partial<StaffFormData>;
  onChange: (data: Partial<StaffFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  mode
}) => {
  const handleChange = (field: keyof StaffFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  // Generate a random password
  const generateRandomPassword = (length = 12): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const crypto = window.crypto || (window as any).msCrypto;
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    return password;
  };

  return (
    <form onSubmit={onSubmit} className="p-6">
      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Ahmad"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Zaki"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. ahmad.zaki@example.com"
            required
            disabled={mode === 'edit'}
          />
          {mode === 'edit' && (
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          )}
        </div>

        {/* Password - Create Mode */}
        {mode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temporary Password *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.tempPassword || ''}
                onChange={(e) => handleChange('tempPassword', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-24"
                placeholder="Enter temporary password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => {
                  const newPassword = generateRandomPassword();
                  onChange({ ...formData, tempPassword: newPassword });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters. You can share this password with the user directly.
            </p>
          </div>
        )}

        {/* Password - Edit Mode */}
        {mode === 'edit' && (
          <div>
            {!formData.hasChangedPassword && formData.tempPassword ? (
              // Show temp password if user hasn't changed it yet
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Temporary Password</h4>
                    <p className="text-xs text-amber-700 mb-3">
                      User has not changed their password yet. You can still view and share the temporary password.
                    </p>
                    <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-lg p-3 mb-3">
                      <code className="flex-1 text-sm font-mono text-gray-900">{formData.tempPassword}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(formData.tempPassword || '');
                          alert('Password copied to clipboard!');
                        }}
                        className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-amber-600">
                      ⚠️ Once the user changes their password, you will no longer be able to view it.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Show password reset option if user has changed password
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Password Reset</h4>
                    <p className="text-xs text-blue-700 mb-3">
                      {formData.hasChangedPassword
                        ? 'User has changed their password. For security, you cannot view it.'
                        : 'For security, you cannot view user passwords.'}
                      {' '}The user can receive a password reset email to set a new password.
                    </p>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sendPasswordReset || false}
                        onChange={(e) => onChange({ ...formData, sendPasswordReset: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-blue-900 font-medium">
                        Send password reset email to {formData.email}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. +60123456789"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            value={formData.role || 'Staff'}
            onChange={(e) => handleChange('role', e.target.value as StaffFormData['role'])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          >
            <option value="Staff">Staff</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {mode === 'create' ? 'Create Staff' : 'Update Staff'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
