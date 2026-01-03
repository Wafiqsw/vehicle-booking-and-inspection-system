'use client';

import { useState, useEffect } from 'react';
import { Sidebar, BookingTable, AuthLoading } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { FaKey } from 'react-icons/fa';
import { MdSearch } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Booking, Inspection } from '@/types';

const ReceptionistHistory = () => {
  const { user, loading } = useAuth({
    redirectTo: '/receptionist/auth',
    requiredRole: ['Receptionist', 'Admin']
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchDate, setSearchDate] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLoading, setDataLoading] = useState(true);
  const entriesPerPage = 10;

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const bookingsData = await getAllDocuments('bookings');
        const inspectionsData = await getAllDocuments('inspections');

        // Convert Firestore Timestamps to Date objects and filter for history
        const historyBookings = (bookingsData as any[])
          .map((booking) => ({
            id: booking.id,
            project: booking.project,
            destination: booking.destination || '',
            passengers: booking.passengers || 0,
            bookingStatus: booking.bookingStatus !== undefined ? booking.bookingStatus : false,
            keyCollectionStatus: booking.keyCollectionStatus !== undefined ? booking.keyCollectionStatus : false,
            keyReturnStatus: booking.keyReturnStatus !== undefined ? booking.keyReturnStatus : false,
            bookingDate: booking.bookingDate?.toDate ? booking.bookingDate.toDate() : new Date(booking.bookingDate),
            returnDate: booking.returnDate?.toDate ? booking.returnDate.toDate() : new Date(booking.returnDate),
            createdAt: booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt),
            updatedAt: booking.updatedAt?.toDate ? booking.updatedAt.toDate() : new Date(booking.updatedAt),
            managedBy: booking.managedBy,
            approvedBy: booking.approvedBy,
            bookedBy: booking.bookedBy,
            vehicle: booking.vehicle,
            rejectionReason: booking.rejectionReason,
          } as Booking))
          .filter((booking) => {
            // Show in history if keys have been returned (completed trip)
            return booking.keyReturnStatus;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const typedInspections = inspectionsData.map((insp: any) => ({
          id: insp.id,
          inspectionFormType: insp.inspectionFormType,
          inspectionDate: insp.inspectionDate?.toDate ? insp.inspectionDate.toDate() : new Date(),
          nextVehicleServiceDate: insp.nextVehicleServiceDate?.toDate ? insp.nextVehicleServiceDate.toDate() : new Date(),
          vehicleMilleage: insp.vehicleMilleage || 0,
          parts: insp.parts || {},
          images: insp.images || {},
          createdAt: insp.createdAt?.toDate ? insp.createdAt.toDate() : new Date(),
          updatedAt: insp.updatedAt?.toDate ? insp.updatedAt.toDate() : new Date(),
          booking: insp.booking
        }));

        setBookings(historyBookings);
        setInspections(typedInspections);
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        alert('Error loading booking history: ' + error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <AuthLoading />;
  if (!user) return null;

  // Filter bookings based on search
  const filteredBookings = bookings.filter((booking) => {
    const bookingDateStr = booking.bookingDate.toISOString().split('T')[0];
    const returnDateStr = booking.returnDate.toISOString().split('T')[0];
    const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim().toLowerCase();
    const plateNumber = booking.vehicle?.plateNumber?.toLowerCase() || '';
    const staffName = `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim().toLowerCase();

    const matchesDate = searchDate === '' ||
      bookingDateStr === searchDate ||
      returnDateStr === searchDate;
    const matchesVehicle = searchVehicle === '' ||
      vehicleName.includes(searchVehicle.toLowerCase()) ||
      plateNumber.includes(searchVehicle.toLowerCase()) ||
      staffName.includes(searchVehicle.toLowerCase());

    return matchesDate && matchesVehicle;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render action button for each booking
  const renderActions = (booking: Booking) => (
    <Link
      href={`/receptionist/bookings/${booking.id}`}
      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium inline-block text-xs"
    >
      View Details
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-600 mt-2">View all past bookings and key management records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total History</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Collected</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {bookings.filter(b => b.keyCollectionStatus).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Returned</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {bookings.filter(b => b.keyReturnStatus).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MdSearch className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Search Bookings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Date
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Vehicle, Plate, or Staff
              </label>
              <input
                type="text"
                value={searchVehicle}
                onChange={(e) => {
                  setSearchVehicle(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g., Toyota Hilux, ABC 1234, Ahmad..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Booking Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              {dataLoading ? 'Loading...' : `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredBookings.length)} of ${filteredBookings.length} entries`}
            </p>
          </div>

          <BookingTable
            bookings={currentBookings}
            inspections={inspections}
            emptyMessage="No bookings found matching your search criteria"
            showActions={true}
            renderActions={renderActions}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReceptionistHistory;
