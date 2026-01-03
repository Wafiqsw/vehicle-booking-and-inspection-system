'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Chip } from '@/components';
import { staffNavLinks } from '@/constant';
import { FaCar } from 'react-icons/fa';
import { MdHistory, MdSearch } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Booking } from '@/types';

const StaffHistory = () => {
  const { user, loading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Receptionist', 'Admin']
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchDate, setSearchDate] = useState('');
  const [searchCar, setSearchCar] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLoading, setDataLoading] = useState(true);
  const entriesPerPage = 10;

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const bookingsData = await getAllDocuments('bookings');

        // Convert Firestore Timestamps to Date objects and filter for history
        const historyBookings = (bookingsData as any[])
          .map((booking) => ({
            ...booking,
            // Convert Firestore Timestamps to JavaScript Date objects
            bookingDate: booking.bookingDate?.toDate ? booking.bookingDate.toDate() : new Date(booking.bookingDate),
            returnDate: booking.returnDate?.toDate ? booking.returnDate.toDate() : new Date(booking.returnDate),
            createdAt: booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt),
            updatedAt: booking.updatedAt?.toDate ? booking.updatedAt.toDate() : new Date(booking.updatedAt),
          }))
          .filter((booking) => {
            // Show in history if:
            // 1. Keys have been returned (completed trip) OR
            // 2. Booking was rejected
            return booking.keyReturnStatus || booking.rejectionReason;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as Booking[]; // Sort by newest first

        setBookings(historyBookings);
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        alert('Error loading booking history: ' + error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading || !user) return null;

  // Filter bookings based on search
  const filteredBookings = bookings.filter((booking) => {
    const bookingDateStr = booking.bookingDate.toISOString().split('T')[0];
    const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim().toLowerCase();

    const matchesDate = !searchDate || bookingDateStr === searchDate;
    const matchesCar = !searchCar || vehicleName.includes(searchCar.toLowerCase());

    return matchesDate && matchesCar;
  });

  const totalEntries = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

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

  // Helper function to get status
  const getBookingStatus = (booking: Booking): { label: string; variant: 'success' | 'error' } => {
    if (booking.rejectionReason) {
      return { label: 'Rejected', variant: 'error' };
    }
    if (booking.keyReturnStatus) {
      return { label: 'Completed', variant: 'success' };
    }
    return { label: 'Unknown', variant: 'error' };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-600 mt-2">View all your past vehicle bookings and inspections</p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MdSearch className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Search Bookings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Clear Filters Button */}
          {(searchDate || searchCar) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchDate('');
                  setSearchCar('');
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

          {dataLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading booking history...</p>
            </div>
          ) : (
            <>
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
                        const bookingDateFormatted = booking.bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const returnDateFormatted = booking.returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
                        const status = getBookingStatus(booking);

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {booking.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaCar className="w-4 h-4 text-gray-400" />
                                {vehicleName}
                              </div>
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
                              <Chip variant={status.variant}>
                                {status.label}
                              </Chip>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                href={`/staff/bookings/${booking.id}`}
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
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          {bookings.length === 0
                            ? 'No booking history found. Complete a booking to see it here.'
                            : 'No bookings found matching your search criteria'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalEntries > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentPage === 1
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
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentPage === totalPages
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffHistory;
