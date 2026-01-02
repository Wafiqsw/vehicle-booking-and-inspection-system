'use client';

import { useState } from 'react';
import { Sidebar, StaffForm, StaffFormData, Chip } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdPerson } from 'react-icons/md';

// Mock staff data
const mockStaffs: StaffFormData[] = [
  {
    id: 'STF-001',
    firstName: 'Ahmad',
    lastName: 'Zaki',
    email: 'ahmad.zaki@company.com',
    phoneNumber: '+60123456789',
    role: 'Staff',
    tempPassword: 'Welcome123',
    hasChangedPassword: false // Still using temp password
  },
  {
    id: 'STF-002',
    firstName: 'Sarah',
    lastName: 'Lee',
    email: 'sarah.lee@company.com',
    phoneNumber: '+60187654321',
    role: 'Staff',
    hasChangedPassword: true // Already changed password
  },
  {
    id: 'STF-003',
    firstName: 'Kumar',
    lastName: 'Rajan',
    email: 'kumar.rajan@company.com',
    phoneNumber: '+60198765432',
    role: 'Staff',
    tempPassword: 'TempPass456',
    hasChangedPassword: false // Still using temp password
  },
  {
    id: 'STF-004',
    firstName: 'Fatimah',
    lastName: 'Zahra',
    email: 'fatimah.zahra@company.com',
    phoneNumber: '+60165432198',
    role: 'Staff',
    hasChangedPassword: true // Already changed password
  },
  {
    id: 'STF-005',
    firstName: 'Wong',
    lastName: 'Mei Ling',
    email: 'wong.meiling@company.com',
    phoneNumber: '+60134567890',
    role: 'Staff',
    hasChangedPassword: true // Already changed password
  },
  {
    id: 'REC-001',
    firstName: 'Siti',
    lastName: 'Nurhaliza',
    email: 'siti.nurhaliza@company.com',
    phoneNumber: '+60176543210',
    role: 'Receptionist',
    tempPassword: 'Recept789',
    hasChangedPassword: false // Still using temp password
  },
  {
    id: 'ADM-001',
    firstName: 'John',
    lastName: 'Admin',
    email: 'john.admin@company.com',
    phoneNumber: '+60145678901',
    role: 'Admin',
    hasChangedPassword: true // Already changed password
  }
];

const ManageStaffs = () => {
  const [staffs, setStaffs] = useState<StaffFormData[]>(mockStaffs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStaff, setSelectedStaff] = useState<StaffFormData | null>(null);
  const [formData, setFormData] = useState<Partial<StaffFormData>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffFormData | null>(null);

  // Filter staffs
  const filteredStaffs = staffs.filter((staff) => {
    const matchesSearch =
      staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phoneNumber.includes(searchQuery);

    const matchesRole = filterRole === 'All' || staff.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Handle create staff
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      tempPassword: '', // Admin will set or generate password
      phoneNumber: '',
      role: 'Staff'
    });
    setSelectedStaff(null);
    setShowModal(true);
  };

  // Handle edit staff
  const handleEdit = (staff: StaffFormData) => {
    setModalMode('edit');
    setFormData({
      ...staff,
      sendPasswordReset: false // Default unchecked
    });
    setSelectedStaff(staff);
    setShowModal(true);
  };

  // Handle delete staff
  const handleDelete = (staff: StaffFormData) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      setStaffs(staffs.filter(s => s.id !== staffToDelete.id));
      alert(`Staff ${staffToDelete.firstName} ${staffToDelete.lastName} deleted successfully!`);
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      // Validate password
      if (!formData.tempPassword || formData.tempPassword.length < 6) {
        alert('Password is required and must be at least 6 characters');
        return;
      }

      // TODO: When integrating with Firebase:
      // 1. Create user with the temporary password
      // 2. Store additional user data in Firestore including tempPassword and hasChangedPassword
      // 3. User uses temp password to login and can change it later
      //
      // Example:
      // try {
      //   const userCredential = await createUserWithEmailAndPassword(
      //     auth,
      //     formData.email!,
      //     formData.tempPassword!
      //   );
      //
      //   await setDoc(doc(db, 'users', userCredential.user.uid), {
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     phoneNumber: formData.phoneNumber,
      //     role: formData.role,
      //     email: formData.email,
      //     tempPassword: formData.tempPassword, // Store temporarily
      //     hasChangedPassword: false, // Track if user changed password
      //     createdAt: serverTimestamp(),
      //     createdBy: auth.currentUser?.uid
      //   });
      //
      //   alert('Staff created successfully! Share the temporary password with the user.');
      // } catch (error: any) {
      //   if (error.code === 'auth/email-already-in-use') {
      //     alert('Error: Email address is already in use');
      //   } else {
      //     alert('Error creating staff: ' + error.message);
      //   }
      // }

      // Generate new ID (for mock data)
      const newId = `STF-${String(staffs.length + 1).padStart(3, '0')}`;
      const newStaff: StaffFormData = {
        id: newId,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        phoneNumber: formData.phoneNumber!,
        role: formData.role || 'Staff',
        tempPassword: formData.tempPassword,
        hasChangedPassword: false // New user hasn't changed password yet
      };

      setStaffs([...staffs, newStaff]);
      alert('Staff created successfully! You can now view and share the temporary password.');
    } else {
      // TODO: When integrating with Firebase:
      // 1. Update user data in Firestore
      // 2. If sendPasswordReset is checked, send password reset email
      //
      // Example:
      // await updateDoc(doc(db, 'users', selectedStaff.id), {
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   phoneNumber: formData.phoneNumber,
      //   role: formData.role
      // });
      // if (formData.sendPasswordReset) {
      //   await sendPasswordResetEmail(auth, formData.email!);
      // }

      // Update existing staff
      setStaffs(staffs.map(staff =>
        staff.id === selectedStaff?.id
          ? {
              ...staff,
              firstName: formData.firstName!,
              lastName: formData.lastName!,
              phoneNumber: formData.phoneNumber!,
              role: formData.role || staff.role
            }
          : staff
      ));

      if (formData.sendPasswordReset) {
        alert('Staff updated successfully! Password reset email sent to user.');
      } else {
        alert('Staff updated successfully!');
      }
    }

    setShowModal(false);
    setFormData({});
    setSelectedStaff(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({});
    setSelectedStaff(null);
  };

  const getRoleChip = (role: string) => {
    const variant = role === 'Admin'
      ? 'error'
      : role === 'Receptionist'
      ? 'info'
      : 'default';
    return <Chip variant={variant}>{role}</Chip>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-2">Manage staff accounts and permissions</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              <MdAdd className="w-5 h-5" />
              Add New Staff
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MdSearch className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Staff
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Search by name, email, or phone..."
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="All">All Roles</option>
                <option value="Staff">Staff</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterRole !== 'All') && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('All');
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Staff List Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MdPerson className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Staff List</h2>
                <p className="text-xs text-gray-500">{filteredStaffs.length} staff members</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {filteredStaffs.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No staff found
                    </td>
                  </tr>
                ) : (
                  filteredStaffs.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {staff.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {staff.firstName} {staff.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {staff.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {staff.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleChip(staff.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                          >
                            <MdEdit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(staff)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                          >
                            <MdDelete className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Staff Account Management</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li><strong>Staff</strong> accounts can login and make vehicle booking and inspection requests</li>
                <li><strong>Receptionist</strong> accounts can manage key collection and return processes</li>
                <li><strong>Admin</strong> accounts have full access to all system features</li>
              </ul>
              <p className="font-semibold mt-3 mb-2">Password Security</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Email addresses are unique and cannot be changed after account creation</li>
                <li>When creating staff, set a temporary password (min. 6 characters) or use "Generate"</li>
                <li>You can view and copy the temp password to share with the user (phone, in-person, etc.)</li>
                <li>Once the user changes their password, you can no longer view it</li>
                <li>Users are encouraged to change their password on first login for security</li>
                <li>If user forgets password, use "Send password reset email" when editing their account</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Staff' : 'Edit Staff'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <StaffForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              mode={modalMode}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{staffToDelete.firstName} {staffToDelete.lastName}</strong>?
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStaffToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaffs;
