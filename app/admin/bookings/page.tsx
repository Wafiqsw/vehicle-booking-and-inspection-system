'use client';

import { useState } from 'react';
import { Sidebar, Booking } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdRemoveRedEye, MdCheck, MdClose } from 'react-icons/md';
import Link from 'next/link';

// Mock bookings data - all bookings (pending, approved, rejected)
const bookingsData: Booking[] = [
  {
    id: 'BK-006',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    staffName: 'Ahmad Zaki',
    project: 'Highland Towers Construction',
    bookingDate: '2025-01-20',
    returnDate: '2025-01-22',
    destination: 'Kuala Lumpur',
    status: 'Pending',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Not Submitted',
    postInspectionStatus: 'Not Submitted',
  },
  {
    id: 'BK-007',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    staffName: 'Sarah Lee',
    project: 'Sunway Development Project',
    bookingDate: '2025-01-18',
    returnDate: '2025-01-19',
    destination: 'Selangor',
    status: 'Pending',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Not Submitted',
    postInspectionStatus: 'Not Submitted',
  },
  {
    id: 'BK-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    staffName: 'Ahmad Zaki',
    project: 'Highland Towers Construction',
    bookingDate: '2025-01-05',
    returnDate: '2025-01-06',
    destination: 'Kuala Lumpur',
    status: 'Approved',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Submitted',
  },
  {
    id: 'BK-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    staffName: 'Sarah Lee',
    project: 'Sunway Development Project',
    bookingDate: '2025-01-08',
    returnDate: '2025-01-09',
    destination: 'Selangor',
    status: 'Approved',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Not Submitted',
  },
  {
    id: 'BK-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'GHI 9012',
    staffName: 'Kumar Rajan',
    project: 'Johor Bahru Mall Renovation',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-11',
    destination: 'Johor',
    status: 'Approved',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Returned',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Submitted',
  },
  {
    id: 'BK-008',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'JKL 3456',
    staffName: 'Fatimah Zahra',
    project: 'Penang Bridge Maintenance',
    bookingDate: '2025-01-15',
    returnDate: '2025-01-16',
    destination: 'Penang',
    status: 'Rejected',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Not Submitted',
    postInspectionStatus: 'Not Submitted',
  },
];

const ManageBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(bookingsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'disapprove' | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Sort bookings by date (latest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.bookingDate).getTime();
    const dateB = new Date(b.bookingDate).getTime();
    return dateB - dateA; // Latest first
  });

  // Apply search and filter
  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.project.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Pending') return matchesSearch && booking.status === 'Pending';
    if (filterStatus === 'Approved') return matchesSearch && booking.status === 'Approved';
    if (filterStatus === 'Rejected') return matchesSearch && booking.status === 'Rejected';

    return matchesSearch;
  });

  // Handle approve/disapprove actions
  const handleApprovalAction = (booking: Booking, action: 'approve' | 'disapprove') => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmApprovalAction = () => {
    if (!selectedBooking || !modalAction) return;

    // Validate rejection reason if rejecting
    if (modalAction === 'disapprove' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    // Update the booking status
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === selectedBooking.id
          ? {
              ...booking,
              status: modalAction === 'approve' ? 'Approved' : 'Rejected',
              rejectionReason: modalAction === 'disapprove' ? rejectionReason : undefined
            }
          : booking
      )
    );

    alert(`Booking ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully!`);

    setShowModal(false);
    setSelectedBooking(null);
    setModalAction(null);
    setRejectionReason('');
  };

  const cancelApprovalAction = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setModalAction(null);
    setRejectionReason('');
  };

  // Render status action buttons (Approve/Reject)
  const renderStatusActions = (booking: Booking) => {
    if (booking.status === 'Pending') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprovalAction(booking, 'approve')}
            className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-xs transition-colors"
            title="Approve Booking"
          >
            <MdCheck className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => handleApprovalAction(booking, 'disapprove')}
            className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-xs transition-colors"
            title="Reject Booking"
          >
            <MdClose className="w-4 h-4" />
            Reject
          </button>
        </div>
      );
    }

    // Show status for non-pending bookings
    return (
      <div className="text-sm">
        {booking.status === 'Approved' && (
          <span className="text-green-600 font-medium">Approved</span>
        )}
        {booking.status === 'Rejected' && (
          <div className="text-red-600 font-medium">
            <span>Rejected</span>
            {booking.rejectionReason && (
              <div className="text-xs text-red-500 mt-1">Reason: {booking.rejectionReason}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render action buttons (View Booking)
  const renderActions = (booking: Booking) => {
    return (
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-xs transition-colors"
      >
        <MdRemoveRedEye className="w-3 h-3" />
        View Booking
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-600 mt-2">Review and approve booking requests</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Booking ID, Vehicle, Staff, or Project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="All">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Booking Requests</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.vehicle}</div>
                        <div className="text-xs text-gray-500">{booking.plateNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.staffName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.bookingDate}</div>
                        <div className="text-xs text-gray-500">Return: {booking.returnDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.status === 'Approved' && (
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        )}
                        {booking.status === 'Pending' && (
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                        {booking.status === 'Rejected' && (
                          <div>
                            <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Rejected
                            </span>
                            {booking.rejectionReason && (
                              <div className="text-xs text-red-600 mt-1">Reason: {booking.rejectionReason}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderStatusActions(booking)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderActions(booking)}
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
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Admin Guide</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review pending booking requests and approve or reject them</li>
                <li>• Use "View Forms" to access inspection reports for approved bookings</li>
                <li>• Bookings are sorted by latest date first</li>
                <li>• Key collection and return are managed by the receptionist</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showModal && selectedBooking && modalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Date:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.returnDate}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {modalAction === 'approve'
                ? 'Are you sure you want to approve this booking request? The staff will be notified and can proceed with the booking.'
                : 'Please provide a reason for rejecting this booking request. The staff will be notified of the rejection.'}
            </p>

            {/* Rejection Reason Input */}
            {modalAction === 'disapprove' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="e.g., Vehicle not available on requested dates, insufficient justification, etc."
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmApprovalAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={cancelApprovalAction}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
