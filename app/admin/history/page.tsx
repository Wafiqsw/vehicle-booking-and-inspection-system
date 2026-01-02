'use client';

import React, { useState } from 'react';
import { Sidebar, Chip } from '@/components';
import { adminNavLinks } from '@/constant';
import { FaCar } from 'react-icons/fa';
import { MdHistory, MdSearch } from 'react-icons/md';
import Link from 'next/link';

// Mock booking data for admin (includes staff names)
const allBookings = [
  { id: 'BK-001', vehicle: 'Toyota Hilux', staffName: 'Ahmad Zaki', bookingDate: '2024-10-15', returnDate: '2024-10-16', project: 'Highland Towers Construction', status: 'Completed' },
  { id: 'BK-002', vehicle: 'Isuzu D-Max', staffName: 'Fatimah Zahra', bookingDate: '2024-10-18', returnDate: '2024-10-19', project: 'Penang Bridge Maintenance', status: 'Completed' },
  { id: 'BK-003', vehicle: 'Nissan Navara', staffName: 'Kumar Rajan', bookingDate: '2024-10-22', returnDate: '2024-10-23', project: 'Johor Bahru Mall Renovation', status: 'Completed' },
  { id: 'BK-004', vehicle: 'Ford Ranger', staffName: 'Sarah Lee', bookingDate: '2024-10-25', returnDate: '2024-10-26', project: 'Sunway Development Project', status: 'Completed' },
  { id: 'BK-005', vehicle: 'Toyota Hilux', staffName: 'Ahmad Zaki', bookingDate: '2024-10-28', returnDate: '2024-10-29', project: 'Highland Towers Construction', status: 'Completed' },
  { id: 'BK-006', vehicle: 'Mitsubishi Triton', staffName: 'Wong Mei Ling', bookingDate: '2024-11-01', returnDate: '2024-11-02', project: 'Melaka Heritage Site Restoration', status: 'Rejected' },
  { id: 'BK-007', vehicle: 'Isuzu D-Max', staffName: 'Fatimah Zahra', bookingDate: '2024-11-05', returnDate: '2024-11-06', project: 'Penang Bridge Maintenance', status: 'Completed' },
  { id: 'BK-008', vehicle: 'Nissan Navara', staffName: 'Kumar Rajan', bookingDate: '2024-11-08', returnDate: '2024-11-09', project: 'Johor Bahru Mall Renovation', status: 'Completed' },
  { id: 'BK-009', vehicle: 'Ford Ranger', staffName: 'Sarah Lee', bookingDate: '2024-11-12', returnDate: '2024-11-13', project: 'Sunway Development Project', status: 'Completed' },
  { id: 'BK-010', vehicle: 'Toyota Hilux', staffName: 'Ahmad Zaki', bookingDate: '2024-11-15', returnDate: '2024-11-16', project: 'Highland Towers Construction', status: 'Completed' },
  { id: 'BK-011', vehicle: 'Mitsubishi Triton', staffName: 'Wong Mei Ling', bookingDate: '2024-11-19', returnDate: '2024-11-20', project: 'Melaka Heritage Site Restoration', status: 'Completed' },
  { id: 'BK-012', vehicle: 'Isuzu D-Max', staffName: 'Fatimah Zahra', bookingDate: '2024-11-22', returnDate: '2024-11-23', project: 'Penang Bridge Maintenance', status: 'Rejected' },
  { id: 'BK-013', vehicle: 'Nissan Navara', staffName: 'Kumar Rajan', bookingDate: '2024-11-26', returnDate: '2024-11-27', project: 'Johor Bahru Mall Renovation', status: 'Completed' },
  { id: 'BK-014', vehicle: 'Ford Ranger', staffName: 'Sarah Lee', bookingDate: '2024-11-29', returnDate: '2024-11-30', project: 'Sunway Development Project', status: 'Completed' },
  { id: 'BK-015', vehicle: 'Toyota Hilux', staffName: 'Ahmad Zaki', bookingDate: '2024-12-03', returnDate: '2024-12-04', project: 'Highland Towers Construction', status: 'Completed' },
];

const AdminHistory = () => {
  const [searchDate, setSearchDate] = useState('');
  const [searchCar, setSearchCar] = useState('');
  const [searchStaff, setSearchStaff] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Filter bookings based on search
  const filteredBookings = allBookings.filter((booking) => {
    const matchesDate = !searchDate || booking.bookingDate === searchDate;
    const matchesCar = !searchCar || booking.vehicle.toLowerCase().includes(searchCar.toLowerCase());
    const matchesStaff = !searchStaff || booking.staffName.toLowerCase().includes(searchStaff.toLowerCase());
    return matchesDate && matchesCar && matchesStaff;
  });

  const totalEntries = filteredBookings.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to page 1 when filters change
  const handleSearchChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-600 mt-2">View all past vehicle bookings and inspections from all staff</p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MdSearch className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Search Bookings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Date
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  handleSearchChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Select date"
              />
            </div>

            {/* Search by Car Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Vehicle
              </label>
              <input
                type="text"
                value={searchCar}
                onChange={(e) => {
                  setSearchCar(e.target.value);
                  handleSearchChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Toyota Hilux"
              />
            </div>

            {/* Search by Staff Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Staff
              </label>
              <input
                type="text"
                value={searchStaff}
                onChange={(e) => {
                  setSearchStaff(e.target.value);
                  handleSearchChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Ahmad Zaki"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchDate || searchCar || searchStaff) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchDate('');
                  setSearchCar('');
                  setSearchStaff('');
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Booking History Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MdHistory className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Past Bookings</h2>
                <p className="text-xs text-gray-500">Page {currentPage} of {totalPages}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {totalEntries} Total
            </span>
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
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => {
                    const bookingDateFormatted = new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const returnDateFormatted = new Date(booking.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaCar className="w-4 h-4 text-gray-400" />
                            {booking.vehicle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.staffName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {bookingDateFormatted}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {returnDateFormatted}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {booking.project}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip variant={
                            booking.status === 'Completed'
                              ? 'success'
                              : 'error'
                          }>
                            {booking.status}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium inline-block"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                      No bookings found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHistory;
