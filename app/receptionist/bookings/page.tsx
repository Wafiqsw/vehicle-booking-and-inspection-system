'use client';

import { useState, useEffect } from 'react';
import { Sidebar, BookingTable } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { FaKey } from 'react-icons/fa';
import { MdRemoveRedEye } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments, updateDocument, getDocument } from '@/firebase/firestore';
import { Booking, Inspection, Receptionist } from '@/types';
const ManageBookings = () => {
  const { user, loading } = useAuth({
    redirectTo: '/receptionist/auth',
    requiredRole: ['Receptionist', 'Admin']
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [receptionistData, setReceptionistData] = useState<Receptionist | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'collect' | 'return' | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch approved bookings and inspections from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Fetch receptionist user data from users collection
        const receptionistDoc = await getDocument('users', user.uid);
        if (receptionistDoc) {
          setReceptionistData({
            id: receptionistDoc.id || user.uid,
            email: receptionistDoc.email || user.email || '',
            firstName: receptionistDoc.firstName || '',
            lastName: receptionistDoc.lastName || '',
            phoneNumber: receptionistDoc.phoneNumber || '',
            role: receptionistDoc.role || 'Receptionist',
            createdAt: receptionistDoc.createdAt?.toDate ? receptionistDoc.createdAt.toDate() : new Date(),
            updatedAt: receptionistDoc.updatedAt?.toDate ? receptionistDoc.updatedAt.toDate() : new Date(),
          });
        }

        const [bookingsData, inspectionsData] = await Promise.all([
          getAllDocuments('bookings'),
          getAllDocuments('inspections')
        ]);

        // Filter to show only approved bookings
        const approvedBookings = bookingsData
          .filter((b: any) => b.bookingStatus === true)
          .map((doc: any): Booking => ({
            id: doc.id,
            project: doc.project || '',
            destination: doc.destination || '',
            passengers: doc.passengers || 0,
            bookingStatus: doc.bookingStatus || false,
            keyCollectionStatus: doc.keyCollectionStatus || false,
            keyReturnStatus: doc.keyReturnStatus || false,
            bookingDate: doc.bookingDate?.toDate ? doc.bookingDate.toDate() : new Date(doc.bookingDate),
            returnDate: doc.returnDate?.toDate ? doc.returnDate.toDate() : new Date(doc.returnDate),
            createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
            updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
            managedBy: doc.managedBy || null,
            approvedBy: doc.approvedBy || null,
            bookedBy: doc.bookedBy || null,
            vehicle: doc.vehicle || { id: '', brand: '', model: '', plateNumber: '', type: '', fuelType: '', year: 0, seatCapacity: 0, maintenanceStatus: false },
            rejectionReason: doc.rejectionReason
          }));

        setBookings(approvedBookings);

        // Map inspections
        const allInspections = inspectionsData.map((doc: any): Inspection => ({
          id: doc.id,
          inspectionFormType: doc.inspectionFormType || 'pre',
          inspectionDate: doc.inspectionDate?.toDate ? doc.inspectionDate.toDate() : new Date(doc.inspectionDate),
          nextVehicleServiceDate: doc.nextVehicleServiceDate?.toDate ? doc.nextVehicleServiceDate.toDate() : new Date(doc.nextVehicleServiceDate),
          vehicleMilleage: doc.vehicleMilleage || 0,
          parts: doc.parts || {},
          images: doc.images || {},
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
          booking: doc.booking || { id: '' }
        }));

        setInspections(allInspections);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        alert('Error loading data: ' + error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null;

  // Filter out hidden bookings (completed and 7+ days past return)
  const activeBookings = bookings.filter(booking => {
    const returnDate = new Date(booking.returnDate);
    const today = new Date();
    const daysPastReturn = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));

    // Hide if completed and 7+ days past return
    const shouldHide = daysPastReturn >= 7 && booking.keyReturnStatus;
    return !shouldHide;
  });

  // Separate overdue and normal bookings
  const overdueBookings = activeBookings.filter(booking => {
    const returnDate = new Date(booking.returnDate);
    const today = new Date();
    return today > returnDate && !booking.keyReturnStatus;
  });

  const normalBookings = activeBookings.filter(booking => {
    const returnDate = new Date(booking.returnDate);
    const today = new Date();
    return today <= returnDate || booking.keyReturnStatus;
  });

  // Combine: overdue first (pinned), then normal
  const sortedBookings = [...overdueBookings, ...normalBookings];

  // Apply search and filter
  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookedBy?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookedBy?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.project.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Key Not Collected') return matchesSearch && !booking.keyCollectionStatus;
    if (filterStatus === 'Key Collected') return matchesSearch && booking.keyCollectionStatus && !booking.keyReturnStatus;
    if (filterStatus === 'Key Returned') return matchesSearch && booking.keyReturnStatus;

    return matchesSearch;
  });

  // Handle key collection/return actions
  const handleKeyAction = (booking: Booking, action: 'collect' | 'return') => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmKeyAction = async () => {
    if (!selectedBooking || !modalAction) return;

    // VALIDATION: Check if pre-trip inspection is submitted before allowing key collection
    if (modalAction === 'collect') {
      const hasPreInspection = inspections.some(
        (inspection) =>
          inspection.booking.id === selectedBooking.id &&
          inspection.inspectionFormType === 'pre'
      );

      if (!hasPreInspection) {
        alert('❌ Cannot collect key!\n\nStaff must submit Pre-Trip Inspection form first.');
        setShowModal(false);
        setSelectedBooking(null);
        setModalAction(null);
        return;
      }
    }

    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (modalAction === 'collect') {
        updateData.keyCollectionStatus = true;
        updateData.managedBy = {
          id: user.uid,
          firstName: receptionistData?.firstName || user.email?.split('@')[0] || 'Receptionist',
          lastName: receptionistData?.lastName || '',
          email: receptionistData?.email || user.email || '',
          phoneNumber: receptionistData?.phoneNumber || '',
          role: 'Receptionist'
        };
      } else {
        updateData.keyReturnStatus = true;
      }

      await updateDocument('bookings', selectedBooking.id, updateData);

      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBooking.id
            ? {
              ...booking,
              ...updateData,
              updatedAt: updateData.updatedAt
            }
            : booking
        )
      );

      alert(`Key ${modalAction === 'collect' ? 'collection' : 'return'} confirmed for ${selectedBooking.id}`);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      alert('Error updating booking: ' + error.message);
    } finally {
      setShowModal(false);
      setSelectedBooking(null);
      setModalAction(null);
    }
  };

  const cancelKeyAction = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setModalAction(null);
  };

  // Render action buttons for each booking
  const renderActions = (booking: Booking) => {
    // Check if pre-trip inspection exists for this booking
    const hasPreInspection = inspections.some(
      (inspection) =>
        inspection.booking.id === booking.id &&
        inspection.inspectionFormType === 'pre'
    );

    return (
      <div className="flex flex-col gap-2">
        {/* Manage Keys Button */}
        <div className="relative">
          {!booking.keyCollectionStatus && (
            <button
              onClick={() => handleKeyAction(booking, 'collect')}
              disabled={!hasPreInspection}
              title={!hasPreInspection ? 'Pre-Trip Inspection required first' : ''}
              className={`w-full inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg font-medium text-xs transition-colors ${hasPreInspection
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
            >
              <FaKey className="w-3 h-3" />
              Collect Key
            </button>
          )}
          {booking.keyCollectionStatus && !booking.keyReturnStatus && (
            <button
              onClick={() => handleKeyAction(booking, 'return')}
              className="w-full inline-flex items-center justify-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium text-xs transition-colors"
            >
              <FaKey className="w-3 h-3" />
              Return Key
            </button>
          )}
          {booking.keyReturnStatus && (
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
  };

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

          {dataLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading bookings...</p>
            </div>
          ) : (
            <BookingTable
              bookings={filteredBookings}
              inspections={inspections}
              emptyMessage="No bookings found"
              showActions={true}
              renderActions={renderActions}
            />
          )}
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
                <li>• Use "View Forms" to access submitted inspection reports</li>
                <li>• Ensure keys are only handed to authorized staff members</li>
                <li>• Verify inspection forms are completed before key handover</li>
                <li>• Overdue bookings are highlighted in red</li>
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
                  <span className="font-semibold text-gray-900">
                    {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBooking.bookedBy?.firstName} {selectedBooking.bookedBy?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plate Number:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.vehicle?.plateNumber}</span>
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
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${modalAction === 'collect'
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
