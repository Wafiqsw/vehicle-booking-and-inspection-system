'use client';

import React from 'react';
import { Sidebar, BookingTable, Booking } from '@/components';
import { staffNavLinks } from '@/constant';
import { FaPlus } from 'react-icons/fa';
import { MdCalendarToday } from 'react-icons/md';
import Link from 'next/link';

// Mock upcoming bookings data - transformed for BookingTable
const upcomingBookingsData: Booking[] = [
  {
    id: 'BK-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'VH-001',
    bookingDate: '2025-01-05',
    returnDate: '2025-01-06',
    project: 'Highland Towers Construction',
    status: 'Approved',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Pending',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Pending'
  },
  {
    id: 'BK-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'VH-002',
    bookingDate: '2025-01-08',
    returnDate: '2025-01-09',
    project: 'Sunway Development Project',
    status: 'Pending',
    preInspectionStatus: 'Not Submitted',
    postInspectionStatus: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
  {
    id: 'BK-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'VH-003',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-11',
    project: 'Johor Bahru Mall Renovation',
    status: 'Approved',
    preInspectionStatus: 'Submitted',
    postInspectionStatus: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
  {
    id: 'BK-004',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'VH-004',
    bookingDate: '2025-01-12',
    returnDate: '2025-01-13',
    project: 'Penang Bridge Maintenance',
    status: 'Approved',
    preInspectionStatus: 'Pending',
    postInspectionStatus: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
  {
    id: 'BK-005',
    vehicle: 'Mitsubishi Triton',
    plateNumber: 'VH-005',
    bookingDate: '2025-01-15',
    returnDate: '2025-01-16',
    project: 'Melaka Heritage Site Restoration',
    status: 'Pending',
    preInspectionStatus: 'Not Submitted',
    postInspectionStatus: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
];

const StaffBookings = () => {
  const renderActions = (booking: Booking) => (
    <Link
      href={`/staff/bookings/${booking.id}`}
      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium inline-block text-xs"
    >
      View Details
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage your vehicle booking and inspection requests</p>
            </div>
            <Link href="/staff/bookings/new" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
              <FaPlus className="w-4 h-4" />
              <span className="sm:inline">New Booking</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MdCalendarToday className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Upcoming Bookings</h2>
                <p className="text-xs text-gray-500 hidden sm:block">Next 5 upcoming bookings</p>
              </div>
            </div>
            <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
              {upcomingBookingsData.length}
            </span>
          </div>

          {/* Desktop & Mobile Table View */}
          <BookingTable
            bookings={upcomingBookingsData}
            emptyMessage="No upcoming bookings found"
            showActions={true}
            renderActions={renderActions}
            variant="staff"
          />
        </div>
      </main>
    </div>
  );
};

export default StaffBookings;
