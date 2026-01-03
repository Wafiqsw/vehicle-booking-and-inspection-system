'use client';

import { useState, useEffect } from 'react';
import { Sidebar, Chip } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { FaKey } from 'react-icons/fa';
import { MdRemoveRedEye, MdCheckCircle } from 'react-icons/md';
import { IoAlertCircleOutline } from 'react-icons/io5';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Booking, Inspection } from '@/types';

const ReceptionistDashboard = () => {
  const { user, loading: authLoading } = useAuth({
    redirectTo: '/receptionist/auth',
    requiredRole: ['Receptionist', 'Admin']
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
            vehicle: doc.vehicle,
            rejectionReason: doc.rejectionReason
          }));

        const allInspections = inspectionsData.map((doc: any): Inspection => ({
          id: doc.id,
          inspectionFormType: doc.inspectionFormType || 'pre',
          inspectionDate: doc.inspectionDate?.toDate ? doc.inspectionDate.toDate() : new Date(),
          nextVehicleServiceDate: doc.nextVehicleServiceDate?.toDate ? doc.nextVehicleServiceDate.toDate() : new Date(),
          vehicleMilleage: doc.vehicleMilleage || 0,
          parts: doc.parts || {},
          images: doc.images || {},
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
          booking: doc.booking || { id: '' }
        }));

        setBookings(approvedBookings);
        setInspections(allInspections);
      } catch (error: any) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || !user) return null;

  // Calculate statistics
  const totalBookings = bookings.length;
  const keysNotCollected = bookings.filter(b => !b.keyCollectionStatus).length;
  const keysOut = bookings.filter(b => b.keyCollectionStatus && !b.keyReturnStatus).length;
  const keysReturned = bookings.filter(b => b.keyReturnStatus).length;

  // Get upcoming key collections (not collected yet, sorted by booking date)
  const upcomingCollections = bookings
    .filter(b => !b.keyCollectionStatus)
    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
    .slice(0, 5);

  // Get expected key returns (keys out, sorted by return date)
  const expectedReturns = bookings
    .filter(b => b.keyCollectionStatus && !b.keyReturnStatus)
    .sort((a, b) => new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime())
    .slice(0, 5);

  // Get recently submitted inspections (last 5)
  const recentInspections = inspections
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Helper to check if inspection exists
  const hasInspection = (bookingId: string, type: 'pre' | 'post'): boolean => {
    return inspections.some(
      insp => insp.booking.id === bookingId && insp.inspectionFormType === type
    );
  };

  // Helper to format time ago
  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your key management overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Keys Not Collected */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Not Collected</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{loading ? '...' : keysNotCollected}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Keys Out */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Out</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{loading ? '...' : keysOut}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Keys Returned */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Returned</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{loading ? '...' : keysReturned}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/receptionist/bookings" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage Bookings</p>
                <p className="text-sm text-gray-600">Handle key collection & return</p>
              </div>
            </Link>
            <Link href="/receptionist/history" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Booking History</p>
                <p className="text-sm text-gray-600">View past bookings</p>
              </div>
            </Link>
          </div>
        </div>

        {/* To-Do Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Collection To-Do */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-6 border-b border-gray-200 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Key Collections</h2>
                <p className="text-xs text-gray-500">{upcomingCollections.length} pending</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : upcomingCollections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdCheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No pending key collections!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingCollections.map((booking) => {
                    const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
                    const staffName = `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim();
                    const hasPre = hasInspection(booking.id, 'pre');
                    const dateStr = new Date(booking.bookingDate).toLocaleDateString('en-MY', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <Link
                        key={booking.id}
                        href="/receptionist/bookings"
                        className="flex items-center gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50/30 hover:bg-yellow-100/50 hover:border-yellow-300 transition-all cursor-pointer group"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">
                            {staffName} - {vehicleName} ({booking.vehicle?.plateNumber})
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Collection Date: {dateStr} • {booking.project}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Chip variant={hasPre ? 'success' : 'error'}>
                              Pre-Inspection: {hasPre ? 'Submitted' : 'Not Submitted'}
                            </Chip>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-800">
                  Only hand out keys for bookings with completed pre-trip inspection forms
                </p>
              </div>
            </div>
          </div>

          {/* Key Return To-Do */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-6 border-b border-gray-200 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Expected Key Returns</h2>
                <p className="text-xs text-gray-500">{expectedReturns.length} keys out</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : expectedReturns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdCheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All keys returned!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expectedReturns.map((booking) => {
                    const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
                    const staffName = `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim();
                    const hasPost = hasInspection(booking.id, 'post');
                    const dateStr = new Date(booking.returnDate).toLocaleDateString('en-MY', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <Link
                        key={booking.id}
                        href="/receptionist/bookings"
                        className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                            {staffName} - {vehicleName} ({booking.vehicle?.plateNumber})
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Return Date: {dateStr} • {booking.project}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Chip variant={hasPost ? 'success' : 'error'}>
                              Post-Inspection: {hasPost ? 'Submitted' : 'Not Submitted'}
                            </Chip>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">
                  Verify post-trip inspection forms are completed before accepting key returns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Submitted Inspection Forms */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <MdRemoveRedEye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recently Submitted Inspection Forms</h2>
              <p className="text-xs text-gray-500">Latest {recentInspections.length} submissions</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : recentInspections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent inspections</div>
            ) : (
              <div className="space-y-3">
                {recentInspections.map((inspection) => {
                  const booking = bookings.find(b => b.id === inspection.booking.id);
                  if (!booking) return null;

                  const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
                  const staffName = `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim();
                  const formType = inspection.inspectionFormType === 'pre' ? 'Pre-Trip' : 'Post-Trip';

                  return (
                    <div key={inspection.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50/30">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {formType} Inspection - {staffName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {vehicleName} ({booking.vehicle?.plateNumber}) • Submitted {timeAgo(inspection.createdAt)}
                        </p>
                      </div>
                      <Link
                        href={`/receptionist/bookings/${booking.id}/inspection`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-xs transition-colors"
                      >
                        <MdRemoveRedEye className="w-3 h-3" />
                        View Form
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
