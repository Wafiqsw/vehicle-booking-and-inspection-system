'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components';
import { adminNavLinks } from '@/constant';
import { FaCar, FaUsers, FaCarSide } from 'react-icons/fa';
import { MdPending, MdCheckCircle, MdCancel } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Booking } from '@/types';
import Link from 'next/link';

const AdminDashboard = () => {
  const { user, loading } = useAuth({
    redirectTo: '/admin/auth',
    requiredRole: 'Admin'
  });

  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalVehicles: 0,
    activeBookings: 0,
    activeUsers: 0
  });

  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Fetch all data in parallel
        const [bookingsData, vehiclesData, usersData] = await Promise.all([
          getAllDocuments('bookings'),
          getAllDocuments('vehicles'),
          getAllDocuments('users')
        ]);

        // Map bookings to Booking type
        const mappedBookings: Booking[] = bookingsData.map((doc: any) => ({
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
          vehicle: doc.vehicle || null,
          rejectionReason: doc.rejectionReason
        }));

        // Calculate stats
        const pendingCount = mappedBookings.filter(
          (b) => !b.bookingStatus && !b.rejectionReason
        ).length;

        const activeCount = mappedBookings.filter(
          (b) => b.bookingStatus && !b.keyReturnStatus
        ).length;

        setStats({
          pendingApprovals: pendingCount,
          totalVehicles: vehiclesData.length,
          activeBookings: activeCount,
          activeUsers: usersData.length
        });

        // Get pending bookings for table (show first 5, sorted by newest)
        const pending = mappedBookings
          .filter((b) => !b.bookingStatus && !b.rejectionReason)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        setPendingBookings(pending);

        // Get recent decisions (approved or rejected in last 7 days, show first 5)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const decisions = mappedBookings
          .filter((b) => {
            const hasDecision = b.bookingStatus || b.rejectionReason;
            const isRecent = b.updatedAt >= sevenDaysAgo;
            return hasDecision && isRecent;
          })
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 5);

        setRecentDecisions(decisions);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        alert('Error loading dashboard data: ' + error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Helper function to format relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Approve bookings and oversee system operations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {dataLoading ? '...' : stats.pendingApprovals}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Vehicles */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dataLoading ? '...' : stats.totalVehicles}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaCarSide className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {dataLoading ? '...' : stats.activeBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaCar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dataLoading ? '...' : stats.activeUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Booking Requests */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pending Booking Requests</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              {stats.pendingApprovals} Pending
            </span>
          </div>

          {dataLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading pending requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingBookings.length > 0 ? (
                    pendingBookings.map((booking) => {
                      const staffName = `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim() || 'Unknown Staff';
                      const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim() || 'Unknown Vehicle';
                      const requestDate = booking.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const bookingDate = booking.bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                      return (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {staffName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {vehicleName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {requestDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {bookingDate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {booking.project}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium inline-block"
                            >
                              View & Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                        No pending booking requests at the moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Booking Decisions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Booking Decisions</h2>
          </div>

          {dataLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading recent decisions...</p>
            </div>
          ) : (
            <div className="p-6">
              {recentDecisions.length > 0 ? (
                <div className="space-y-4">
                  {recentDecisions.map((booking) => {
                    const isApproved = booking.bookingStatus;
                    const staffName = `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim() || 'Unknown Staff';
                    const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim() || 'Unknown Vehicle';
                    const relativeTime = getRelativeTime(booking.updatedAt);

                    return (
                      <div key={booking.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                        <div className={`w-10 h-10 ${isApproved ? 'bg-green-50' : 'bg-red-50'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {isApproved ? (
                            <MdCheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <MdCancel className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Booking {isApproved ? 'Approved' : 'Rejected'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {isApproved ? 'Approved' : 'Rejected'} {staffName}'s request for {vehicleName} - {booking.project}
                            {!isApproved && booking.rejectionReason && ` (${booking.rejectionReason})`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{relativeTime}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recent booking decisions in the last 7 days.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
