'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Chip } from '@/components';
import { staffNavLinks } from '@/constant';
import { FaCar } from 'react-icons/fa';
import { MdPending, MdCheckCircle, MdOutlineChecklist } from 'react-icons/md';
import { IoAlertCircleOutline } from 'react-icons/io5';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Inspection, Booking } from '@/types';
import { getInspectionTodos } from '@/libs/inspectionUtils';

const StaffDashboard = () => {
  const { user, loading: authLoading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Receptionist', 'Admin']
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch all bookings for the user
        const allBookings = await getAllDocuments('bookings');
        const userBookings = allBookings
          .filter((booking: any) => booking.bookedBy?.id === user.uid)
          .map((booking: any) => ({
            id: booking.id,
            project: booking.project,
            destination: booking.destination || '',
            passengers: booking.passengers || 0,
            bookingStatus: booking.bookingStatus !== undefined ? booking.bookingStatus : false,
            keyCollectionStatus: booking.keyCollectionStatus !== undefined ? booking.keyCollectionStatus : false,
            keyReturnStatus: booking.keyReturnStatus !== undefined ? booking.keyReturnStatus : false,
            bookingDate: booking.bookingDate?.toDate ? booking.bookingDate.toDate() : new Date(),
            returnDate: booking.returnDate?.toDate ? booking.returnDate.toDate() : new Date(),
            createdAt: booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(),
            updatedAt: booking.updatedAt?.toDate ? booking.updatedAt.toDate() : new Date(),
            managedBy: booking.managedBy,
            approvedBy: booking.approvedBy,
            bookedBy: booking.bookedBy,
            vehicle: booking.vehicle,
            rejectionReason: booking.rejectionReason,
          } as Booking));

        // Fetch all inspections
        const allInspections = await getAllDocuments('inspections');
        const typedInspections = allInspections.map((insp: any) => ({
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

        setBookings(userBookings);
        setInspections(typedInspections);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  console.log('Staff Dashboard - Data:', {
    loading,
    bookingsCount: bookings.length,
    inspectionsCount: inspections.length,
    userUid: user?.uid
  });

  if (authLoading || !user) return null;

  // Calculate statistics (matching bookings page logic)
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => !b.bookingStatus && !b.rejectionReason).length;
  const approvedBookings = bookings.filter(b => b.bookingStatus && !b.rejectionReason).length;
  const rejectedBookings = bookings.filter(b => b.rejectionReason).length;

  // Use reusable utility function with proper business rules:
  // - Pre-trip inspection takes priority
  // - Post-trip inspection requires key collection first
  const inspectionTodos = getInspectionTodos(bookings, inspections);

  // Get recent bookings (last 5)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your booking overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? '...' : totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaCar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {loading ? '...' : pendingBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Approved Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {loading ? '...' : approvedBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/staff/bookings/new" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">New Booking</p>
                <p className="text-sm text-gray-600">Request a vehicle</p>
              </div>
            </Link>
            <Link href="/staff/bookings" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Bookings</p>
                <p className="text-sm text-gray-600">Check your requests</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Bookings and To-Do Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inspection To-Do List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-6 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MdOutlineChecklist className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Inspection Forms To-Do</h2>
                <p className="text-xs text-gray-500">Based on your bookings</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : inspectionTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdCheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All inspections up to date!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inspectionTodos.map((todo) => {
                    const vehicleName = `${todo.booking.vehicle?.brand || ''} ${todo.booking.vehicle?.model || ''}`.trim();
                    const bookingDateStr = new Date(todo.booking.bookingDate).toLocaleDateString('en-MY', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    if (todo.needsPreInspection) {
                      return (
                        <Link
                          key={`pre-${todo.booking.id}`}
                          href={`/staff/bookings/${todo.booking.id}/inspection?type=pre`}
                          className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-300 transition-all cursor-pointer group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                              Submit Pre-Trip Inspection for {vehicleName}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Booking Date: {bookingDateStr} • {todo.booking.project}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      );
                    }

                    if (todo.needsPostInspection) {
                      return (
                        <Link
                          key={`post-${todo.booking.id}`}
                          href={`/staff/bookings/${todo.booking.id}/inspection?type=post`}
                          className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50/30 hover:bg-green-100/50 hover:border-green-300 transition-all cursor-pointer group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">
                              Submit Post-Trip Inspection for {vehicleName}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Booking Date: {bookingDateStr} • {todo.booking.project}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      );
                    }

                    return null;
                  })}
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-800">
                  Complete inspection forms before and after each booking
                </p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => {
                      const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
                      const bookingDateStr = new Date(booking.bookingDate).toLocaleDateString('en-MY', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const statusVariant = booking.bookingStatus ? 'success' : 'pending';
                      const statusText = booking.bookingStatus ? 'Approved' : 'Pending';

                      return (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {vehicleName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {bookingDateStr}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Chip variant={statusVariant}>{statusText}</Chip>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {booking.project}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;