'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Chip, BookingDetailsTable } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, getAllDocuments } from '@/firebase/firestore';
import { BookingDetails } from '@/components/BookingDetailsTable';
import { Booking, Inspection } from '@/types';

const ReceptionistBookingDetailsPage = () => {
  const { user, loading } = useAuth({
    redirectTo: '/receptionist/auth',
    requiredRole: ['Receptionist', 'Admin']
  });

  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [rawBooking, setRawBooking] = useState<Booking | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const [doc, inspectionsData] = await Promise.all([
          getDocument('bookings', bookingId),
          getAllDocuments('inspections')
        ]);

        if (!doc) {
          setError('Booking not found');
          return;
        }

        // Map to Booking type
        const typedBooking: Booking = {
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
        };

        setRawBooking(typedBooking);

        // Check if inspections exist for this booking
        const hasPreInspection = inspectionsData.some(
          (insp: any) => insp.booking?.id === bookingId && insp.inspectionFormType === 'pre'
        );
        const hasPostInspection = inspectionsData.some(
          (insp: any) => insp.booking?.id === bookingId && insp.inspectionFormType === 'post'
        );

        // Map Firestore data to BookingDetails interface
        const mappedBooking: BookingDetails = {
          id: doc.id,
          vehicle: `${doc.vehicle?.brand || ''} ${doc.vehicle?.model || ''}`.trim(),
          plateNumber: doc.vehicle?.plateNumber || '',
          bookingDate: typedBooking.bookingDate.toISOString(),
          returnDate: typedBooking.returnDate.toISOString(),
          project: doc.project || '',
          destination: doc.destination || '',
          passengers: doc.passengers,
          status: doc.rejectionReason ? 'Rejected' : (doc.bookingStatus ? 'Approved' : 'Pending'),
          requestedDate: typedBooking.createdAt.toISOString(),
          notes: doc.notes || '',
          approvedBy: doc.approvedBy ? `${doc.approvedBy.firstName} ${doc.approvedBy.lastName}` : null,
          approvalDate: typedBooking.updatedAt.toISOString(),
          preInspectionForm: hasPreInspection ? 'Submitted' : 'Not Submitted',
          postInspectionForm: hasPostInspection ? 'Submitted' : 'Not Submitted',
          keyCollectionStatus: doc.keyCollectionStatus ? 'Collected' : 'Not Collected',
          keyReturnStatus: doc.keyReturnStatus ? 'Returned' : 'Pending'
        };

        setBooking(mappedBooking);
      } catch (error: any) {
        console.error('Error fetching booking:', error);
        setError(error.message || 'Failed to load booking');
      } finally {
        setDataLoading(false);
      }
    };

    fetchBooking();
  }, [user, bookingId]);

  if (loading || !user) return null;

  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading booking details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're looking for doesn't exist or has been deleted.</p>
            <Link
              href="/receptionist/bookings"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Bookings
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <MdArrowBack className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-2">Booking ID: {booking.id}</p>
            </div>
            <Chip variant={
              booking.status === 'Approved'
                ? 'success'
                : booking.status === 'Rejected'
                  ? 'error'
                  : 'pending'
            }>
              {booking.status}
            </Chip>
          </div>
        </div>

        {/* Rejection Reason */}
        {rawBooking?.rejectionReason && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</h3>
            <p className="text-sm text-red-800">{rawBooking.rejectionReason}</p>
          </div>
        )}

        {/* Staff Info */}
        {rawBooking?.bookedBy && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Booked By</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Name:</span>
                <p className="font-medium text-blue-900">{rawBooking.bookedBy.firstName} {rawBooking.bookedBy.lastName}</p>
              </div>
              <div>
                <span className="text-blue-700">Email:</span>
                <p className="font-medium text-blue-900">{rawBooking.bookedBy.email}</p>
              </div>
              <div>
                <span className="text-blue-700">Phone:</span>
                <p className="font-medium text-blue-900">{rawBooking.bookedBy.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-blue-700">Role:</span>
                <p className="font-medium text-blue-900">{rawBooking.bookedBy.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Information Card */}
        <div className="mb-6">
          <BookingDetailsTable booking={booking} variant="receptionist" />
        </div>

        {/* Inspection Forms Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Inspection Forms</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pre-Trip Inspection */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Pre-Trip Inspection Form</h3>

              {booking.preInspectionForm === 'Submitted' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-sm font-semibold text-green-900">Submitted</span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    Pre-trip inspection has been completed by the staff.
                  </p>
                  <Link
                    href={`/receptionist/bookings/${booking.id}/inspection?type=pre`}
                    className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    View Form
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 font-bold text-lg">✗</span>
                    <span className="text-sm font-semibold text-gray-700">Not Submitted</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Staff has not submitted the pre-trip inspection form yet.
                  </p>
                </div>
              )}
            </div>

            {/* Post-Trip Inspection */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Post-Trip Inspection Form</h3>

              {booking.postInspectionForm === 'Submitted' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-sm font-semibold text-green-900">Submitted</span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    Post-trip inspection has been completed by the staff.
                  </p>
                  <Link
                    href={`/receptionist/bookings/${booking.id}/inspection?type=post`}
                    className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    View Form
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 font-bold text-lg">✗</span>
                    <span className="text-sm font-semibold text-gray-700">Not Submitted</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Staff has not submitted the post-trip inspection form yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Management Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Management Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${booking.keyCollectionStatus === 'Collected' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="text-sm font-semibold mb-1">Key Collection</h3>
              <p className={`text-lg font-bold ${booking.keyCollectionStatus === 'Collected' ? 'text-green-600' : 'text-gray-500'}`}>
                {booking.keyCollectionStatus}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${booking.keyReturnStatus === 'Returned' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="text-sm font-semibold mb-1">Key Return</h3>
              <p className={`text-lg font-bold ${booking.keyReturnStatus === 'Returned' ? 'text-green-600' : 'text-gray-500'}`}>
                {booking.keyReturnStatus}
              </p>
            </div>
          </div>

          {rawBooking?.managedBy && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Managed by:</span> {rawBooking.managedBy.firstName} {rawBooking.managedBy.lastName}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReceptionistBookingDetailsPage;
