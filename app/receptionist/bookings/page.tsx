'use client';

import { useState } from 'react';
import { Sidebar, BookingTable, Booking } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { FaKey } from 'react-icons/fa';
import { MdRemoveRedEye } from 'react-icons/md';
import Link from 'next/link';

// Mock bookings data - only approved bookings that need key management
const bookingsData: Booking[] = [
  {
    id: 'BK-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    staffName: 'Ahmad Zaki',
    project: 'Highland Towers Construction',
    bookingDate: '2025-01-05',
    returnDate: '2025-01-06',
    destination: 'Kuala Lumpur',
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
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Returned',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Submitted',
  },
  {
    id: 'BK-004',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'JKL 3456',
    staffName: 'Fatimah Zahra',
    project: 'Penang Bridge Maintenance',
    bookingDate: '2025-01-12',
    returnDate: '2025-01-13',
    destination: 'Penang',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Not Submitted',
    postInspectionStatus: 'Not Submitted',
  },
  {
    id: 'BK-005',
    vehicle: 'Mitsubishi Triton',
    plateNumber: 'MNO 7890',
    staffName: 'David Tan',
    project: 'Melaka Heritage Site Restoration',
    bookingDate: '2025-01-15',
    returnDate: '2025-01-16',
    destination: 'Melaka',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Pending',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Not Submitted',
  },
];

const ManageBookings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'collect' | 'return' | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter and organize bookings
  const processedBookings = bookingsData.map(booking => {
    const returnDate = new Date(booking.returnDate);
    const today = new Date();
    const daysPastReturn = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if booking is overdue (7+ days past return date with missing key or inspection)
    const isOverdue = daysPastReturn >= 7 && (
      booking.keyReturnStatus !== 'Returned' ||
      booking.preInspectionStatus !== 'Submitted' ||
      booking.postInspectionStatus !== 'Submitted'
    );

    // Check if booking should be hidden (completed and 7+ days past return)
    const shouldHide = daysPastReturn >= 7 &&
      booking.keyReturnStatus === 'Returned' &&
      booking.preInspectionStatus === 'Submitted' &&
      booking.postInspectionStatus === 'Submitted';

    return {
      ...booking,
      isOverdue,
      shouldHide,
      daysPastReturn
    };
  });

  // Filter out hidden bookings
  const activeBookings = processedBookings.filter(booking => !booking.shouldHide);

  // Separate overdue and normal bookings
  const overdueBookings = activeBookings.filter(b => b.isOverdue);
  const normalBookings = activeBookings.filter(b => !b.isOverdue);

  // Combine: overdue first (pinned), then normal
  const sortedBookings = [...overdueBookings, ...normalBookings];

  // Apply search and filter
  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.project.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Key Not Collected') return matchesSearch && booking.keyCollectionStatus === 'Not Collected';
    if (filterStatus === 'Key Collected') return matchesSearch && booking.keyCollectionStatus === 'Collected';
    if (filterStatus === 'Key Returned') return matchesSearch && booking.keyReturnStatus === 'Returned';

    return matchesSearch;
  });

  // Handle key collection/return actions
  const handleKeyAction = (booking: Booking, action: 'collect' | 'return') => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmKeyAction = () => {
    if (!selectedBooking || !modalAction) return;

    // Handle the action (in a real app, this would update the database)
    alert(`Key ${modalAction === 'collect' ? 'collection' : 'return'} confirmed for ${selectedBooking.id}`);

    setShowModal(false);
    setSelectedBooking(null);
    setModalAction(null);
  };

  const cancelKeyAction = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setModalAction(null);
  };

  // Render action buttons for each booking
  const renderActions = (booking: Booking) => (
    <div className="flex flex-col gap-2">
      {/* Manage Keys Button */}
      <div className="relative">
        {booking.keyCollectionStatus === 'Not Collected' && (
          <button
            onClick={() => handleKeyAction(booking, 'collect')}
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-xs transition-colors"
          >
            <FaKey className="w-3 h-3" />
            Collect Key
          </button>
        )}
        {booking.keyCollectionStatus === 'Collected' && booking.keyReturnStatus === 'Pending' && (
          <button
            onClick={() => handleKeyAction(booking, 'return')}
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium text-xs transition-colors"
          >
            <FaKey className="w-3 h-3" />
            Return Key
          </button>
        )}
        {booking.keyReturnStatus === 'Returned' && (
          <div className="w-full inline-flex items-center justify-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium text-xs">
            <FaKey className="w-3 h-3" />
            Completed
          </div>
        )}
      </div>

      {/* View Inspection Forms Button */}
      <Link
        href={`/receptionist/bookings/${booking.id}/inspection`}
        className="w-full inline-flex items-center justify-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-xs transition-colors"
      >
        <MdRemoveRedEye className="w-3 h-3" />
        View Forms
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-600 mt-2">Manage key handover and view inspection forms</p>
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
                <option value="Key Not Collected">Key Not Collected</option>
                <option value="Key Collected">Key Collected</option>
                <option value="Key Returned">Key Returned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Approved Bookings</h2>
          </div>

          <BookingTable
            bookings={filteredBookings}
            emptyMessage="No bookings found"
            showActions={true}
            renderActions={renderActions}
          />
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Receptionist Guide</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "Collect Key" or "Return Key" to manage keys</li>
                <li>• Use "View Forms" dropdown to access submitted inspection reports</li>
                <li>• Ensure keys are only handed to authorized staff members</li>
                <li>• Verify inspection forms are completed before key handover</li>
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
              Confirm Key {modalAction === 'collect' ? 'Collection' : 'Return'}
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
                  <span className="text-gray-600">Plate Number:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.plateNumber}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              {modalAction === 'collect'
                ? 'Please verify the staff identity before handing over the vehicle keys.'
                : 'Please verify the vehicle condition and ensure all inspection forms are completed before accepting the keys.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmKeyAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                  modalAction === 'collect'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirm {modalAction === 'collect' ? 'Collection' : 'Return'}
              </button>
              <button
                onClick={cancelKeyAction}
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
