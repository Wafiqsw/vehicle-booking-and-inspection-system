'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Chip, BookingDetailsTable } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, deleteDocument, getAllDocuments } from '@/firebase/firestore';
import { BookingDetails } from '@/components/BookingDetailsTable';
import { Booking, Inspection } from '@/types';

const BookingDetailsPage = () => {
  // Protect this route - only allow Staff users
  const { user, loading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Admin', 'Receptionist']
  });

  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [rawBooking, setRawBooking] = useState<Booking | null>(null); // Store typed Booking data
  const [dataLoading, setDataLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
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

        // Map inspections
        const allInspections = inspectionsData.map((inspDoc: any): Inspection => ({
          id: inspDoc.id,
          inspectionFormType: inspDoc.inspectionFormType || 'pre',
          inspectionDate: inspDoc.inspectionDate?.toDate ? inspDoc.inspectionDate.toDate() : new Date(inspDoc.inspectionDate),
          nextVehicleServiceDate: inspDoc.nextVehicleServiceDate?.toDate ? inspDoc.nextVehicleServiceDate.toDate() : new Date(inspDoc.nextVehicleServiceDate),
          vehicleMilleage: inspDoc.vehicleMilleage || 0,
          parts: inspDoc.parts || {},
          images: inspDoc.images || {},
          createdAt: inspDoc.createdAt?.toDate ? inspDoc.createdAt.toDate() : new Date(),
          updatedAt: inspDoc.updatedAt?.toDate ? inspDoc.updatedAt.toDate() : new Date(),
          booking: inspDoc.booking || { id: '' }
        }));

        // Helper functions for inspection status
        const hasInspection = (type: 'pre' | 'post'): boolean => {
          return allInspections.some(
            (inspection) =>
              inspection.booking.id === bookingId &&
              inspection.inspectionFormType === type
          );
        };

        const getInspectionStatus = (type: 'pre' | 'post'): string => {
          // If booking not approved, cannot submit
          if (!typedBooking.bookingStatus) {
            return 'Not Submitted';
          }

          // Check if inspection exists
          const exists = hasInspection(type);

          if (exists) return 'Submitted';

          // For pre-trip: can submit once approved
          if (type === 'pre') return 'Pending';

          // For post-trip: can only submit after key collection
          if (type === 'post') {
            return typedBooking.keyCollectionStatus ? 'Pending' : 'Not Submitted';
          }

          return 'Not Submitted';
        };

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
          preInspectionForm: getInspectionStatus('pre'),
          postInspectionForm: getInspectionStatus('post'),
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

  const handleCancelBooking = async () => {
    try {
      await deleteDocument('bookings', bookingId);
      alert('Booking cancelled successfully!');
      router.push('/staff/bookings');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking: ' + error.message);
    }
  };

  const canEdit = rawBooking && !rawBooking.bookingStatus && !rawBooking.rejectionReason; // Can edit if pending and not rejected

  // Can cancel if:
  // 1. Keys not collected yet, AND
  // 2. NOT rejected (any rejected booking cannot be canceled)
  const canCancelBooking = rawBooking &&
    !rawBooking.keyCollectionStatus &&
    !rawBooking.rejectionReason; // Cannot cancel if rejected

  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
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
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're looking for doesn't exist or has been deleted.</p>
            <Link
              href="/staff/bookings"
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
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />

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

        {/* Booking Information Card */}
        <div className="mb-6">
          <BookingDetailsTable booking={booking} variant="staff" />
        </div>

        {/* Inspection Forms Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Inspection Forms</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pre-Trip Inspection Form */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Pre-Trip Inspection Form</h3>

              {/* Submitted State */}
              {booking.preInspectionForm === 'Submitted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-sm font-semibold text-green-900">Submitted</span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    Your pre-trip inspection form has been submitted successfully.
                  </p>
                  <Link
                    href={`/staff/bookings/${booking.id}/inspection?type=pre&view=true`}
                    className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    View Submitted Form
                  </Link>
                </div>
              )}

              {/* Pending State - Can Submit */}
              {booking.preInspectionForm === 'Pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 font-bold text-lg">!</span>
                    <span className="text-sm font-semibold text-blue-900">Action Required</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    Please complete the pre-trip inspection form before collecting vehicle keys.
                  </p>
                  <Link
                    href={`/staff/bookings/${booking.id}/inspection?type=pre`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Fill Pre-Trip Form
                  </Link>
                </div>
              )}

              {/* Not Submitted - Cannot Submit Yet */}
              {booking.preInspectionForm === 'Not Submitted' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 font-bold text-lg">✗</span>
                    <span className="text-sm font-semibold text-gray-700">Not Available</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Waiting for admin to approve your booking request before you can submit this form.
                  </p>
                </div>
              )}
            </div>

            {/* Post-Trip Inspection Form */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Post-Trip Inspection Form</h3>

              {/* Submitted State */}
              {booking.postInspectionForm === 'Submitted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-sm font-semibold text-green-900">Submitted</span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    Your post-trip inspection form has been submitted successfully.
                  </p>
                  <Link
                    href={`/staff/bookings/${booking.id}/inspection?type=post&view=true`}
                    className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    View Submitted Form
                  </Link>
                </div>
              )}

              {/* Pending State - Can Submit */}
              {booking.postInspectionForm === 'Pending' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600 font-bold text-lg">!</span>
                    <span className="text-sm font-semibold text-orange-900">Action Required</span>
                  </div>
                  <p className="text-xs text-orange-700 mb-3">
                    Please complete the post-trip inspection form before returning vehicle keys.
                  </p>
                  <Link
                    href={`/staff/bookings/${booking.id}/inspection?type=post`}
                    className="inline-block px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
                  >
                    Fill Post-Trip Form
                  </Link>
                </div>
              )}

              {/* Not Submitted - Cannot Submit Yet */}
              {booking.postInspectionForm === 'Not Submitted' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 font-bold text-lg">✗</span>
                    <span className="text-sm font-semibold text-gray-700">Not Available</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    You can submit this form after collecting the vehicle keys and completing your trip.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Edit & Cancel Booking Section */}
        {(canEdit || canCancelBooking) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Booking</h2>
            <p className="text-sm text-gray-600 mb-4">
              {canEdit && "You can edit this booking before admin approval. "}
              {canCancelBooking && "You can cancel this booking as long as you haven't collected the vehicle keys yet."}
            </p>
            <div className="flex items-center gap-4">
              {canEdit && (
                <Link
                  href={`/staff/bookings/${booking.id}/edit`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Edit Booking
                </Link>
              )}
              {canCancelBooking && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingDetailsPage;
