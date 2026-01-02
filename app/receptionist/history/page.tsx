'use client';

import { useState } from 'react';
import { Sidebar, BookingTable, Booking } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { FaKey } from 'react-icons/fa';
import { MdSearch } from 'react-icons/md';
import Link from 'next/link';

// Mock booking history data - Only show bookings that are completed, returned, and 7+ days past return date
const allBookingsRaw: Booking[] = [
  { id: 'BK-001', vehicle: 'Toyota Hilux', plateNumber: 'ABC 1234', staffName: 'Ahmad Zaki', bookingDate: '2024-10-15', returnDate: '2024-10-16', project: 'Highland Towers Construction', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-002', vehicle: 'Isuzu D-Max', plateNumber: 'JKL 3456', staffName: 'Fatimah Zahra', bookingDate: '2024-10-18', returnDate: '2024-10-19', project: 'Penang Bridge Maintenance', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-003', vehicle: 'Nissan Navara', plateNumber: 'GHI 9012', staffName: 'Kumar Rajan', bookingDate: '2024-10-22', returnDate: '2024-10-23', project: 'Johor Bahru Mall Renovation', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-004', vehicle: 'Ford Ranger', plateNumber: 'DEF 5678', staffName: 'Sarah Lee', bookingDate: '2024-10-25', returnDate: '2024-10-26', project: 'Sunway Development Project', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-005', vehicle: 'Toyota Hilux', plateNumber: 'ABC 1234', staffName: 'Ahmad Zaki', bookingDate: '2024-10-28', returnDate: '2024-10-29', project: 'Highland Towers Construction', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-006', vehicle: 'Mitsubishi Triton', plateNumber: 'MNO 7890', staffName: 'David Tan', bookingDate: '2024-11-01', returnDate: '2024-11-02', project: 'Melaka Heritage Site Restoration', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-007', vehicle: 'Isuzu D-Max', plateNumber: 'JKL 3456', staffName: 'Fatimah Zahra', bookingDate: '2024-11-05', returnDate: '2024-11-06', project: 'Penang Bridge Maintenance', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-008', vehicle: 'Nissan Navara', plateNumber: 'GHI 9012', staffName: 'Kumar Rajan', bookingDate: '2024-11-08', returnDate: '2024-11-09', project: 'Johor Bahru Mall Renovation', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-009', vehicle: 'Ford Ranger', plateNumber: 'DEF 5678', staffName: 'Sarah Lee', bookingDate: '2024-11-12', returnDate: '2024-11-13', project: 'Sunway Development Project', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-010', vehicle: 'Toyota Hilux', plateNumber: 'ABC 1234', staffName: 'Ahmad Zaki', bookingDate: '2024-11-15', returnDate: '2024-11-16', project: 'Highland Towers Construction', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-011', vehicle: 'Mitsubishi Triton', plateNumber: 'MNO 7890', staffName: 'David Tan', bookingDate: '2024-11-19', returnDate: '2024-11-20', project: 'Melaka Heritage Site Restoration', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-012', vehicle: 'Isuzu D-Max', plateNumber: 'JKL 3456', staffName: 'Fatimah Zahra', bookingDate: '2024-11-22', returnDate: '2024-11-23', project: 'Penang Bridge Maintenance', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-013', vehicle: 'Nissan Navara', plateNumber: 'GHI 9012', staffName: 'Kumar Rajan', bookingDate: '2024-11-26', returnDate: '2024-11-27', project: 'Johor Bahru Mall Renovation', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-014', vehicle: 'Ford Ranger', plateNumber: 'DEF 5678', staffName: 'Sarah Lee', bookingDate: '2024-11-29', returnDate: '2024-11-30', project: 'Sunway Development Project', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
  { id: 'BK-015', vehicle: 'Toyota Hilux', plateNumber: 'ABC 1234', staffName: 'Ahmad Zaki', bookingDate: '2024-12-03', returnDate: '2024-12-04', project: 'Highland Towers Construction', keyCollectionStatus: 'Collected', keyReturnStatus: 'Returned', preInspectionStatus: 'Submitted', postInspectionStatus: 'Submitted' },
];

// Filter bookings: Only show completed and returned, 7+ days past return date
const allBookings = allBookingsRaw.filter(booking => {
  const returnDate = new Date(booking.returnDate);
  const today = new Date();
  const daysPastReturn = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));

  // Only show if key is returned AND it's been 7+ days since return date
  return booking.keyReturnStatus === 'Returned' && daysPastReturn >= 7;
});

const ReceptionistHistory = () => {
  const [searchDate, setSearchDate] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Filter bookings based on search
  const filteredBookings = allBookings.filter((booking) => {
    const matchesDate = searchDate === '' ||
      booking.bookingDate.includes(searchDate) ||
      booking.returnDate.includes(searchDate);
    const matchesVehicle = searchVehicle === '' ||
      booking.vehicle.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      booking.plateNumber.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      booking.staffName?.toLowerCase().includes(searchVehicle.toLowerCase());

    return matchesDate && matchesVehicle;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render action button for each booking
  const renderActions = (booking: Booking) => (
    <Link
      href={`/receptionist/bookings/${booking.id}/inspection`}
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
                <p className="text-3xl font-bold text-gray-900 mt-2">{allBookings.length}</p>
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
                  {allBookings.filter(b => b.keyCollectionStatus === 'Collected').length}
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
                  {allBookings.filter(b => b.keyReturnStatus === 'Returned').length}
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} entries
            </p>
          </div>

          <BookingTable
            bookings={currentBookings}
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
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === 1
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
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
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
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === totalPages
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
