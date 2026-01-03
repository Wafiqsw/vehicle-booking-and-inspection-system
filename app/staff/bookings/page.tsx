'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, BookingTable } from '@/components';
import { staffNavLinks } from '@/constant';
import { FaPlus } from 'react-icons/fa';
import { MdCalendarToday } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Booking, Inspection } from '@/types';

const StaffBookings = () => {
  // Protect this route - only allow Staff users
  const { user, loading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Admin', 'Receptionist']
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch bookings and inspections from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Fetch bookings
        const bookingsData = await getAllDocuments('bookings');

        // Filter to show only current user's bookings and map to Booking type
        const myBookings = bookingsData
          .filter((b: any) => b.bookedBy?.id === user.uid)
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
            vehicle: doc.vehicle || { id: '', brand: '', model: '', plateNumber: '', type: '', capacity: 0, status: 'Available' },
            rejectionReason: doc.rejectionReason
          }));

        setBookings(myBookings);

        // Fetch inspections
        const inspectionsData = await getAllDocuments('inspections');
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

  // Filter bookings by status
  const filteredBookings = filterStatus === 'All'
    ? bookings
    : filterStatus === 'Approved'
      ? bookings.filter(b => b.bookingStatus && !b.rejectionReason)
      : filterStatus === 'Pending'
        ? bookings.filter(b => !b.bookingStatus && !b.rejectionReason)
        : filterStatus === 'Rejected'
          ? bookings.filter(b => b.rejectionReason)
          : bookings;

  const renderActions = (booking: Booking) => (
    <Link
      href={`/staff/bookings/${booking.id}`}
      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium inline-block text-xs"
    >
      View Details
    </Link>
  );

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => !b.bookingStatus && !b.rejectionReason).length,
    approved: bookings.filter(b => b.bookingStatus && !b.rejectionReason).length,
  };

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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MdCalendarToday className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  {filterStatus === 'All' ? 'All Bookings' : `${filterStatus} Bookings`}
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
              {filteredBookings.length}
            </span>
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
              emptyMessage={`No ${filterStatus.toLowerCase()} bookings found`}
              showActions={true}
              renderActions={renderActions}
              variant="staff"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffBookings;
