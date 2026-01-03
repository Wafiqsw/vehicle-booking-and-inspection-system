'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Chip, BookingDetailsTable } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdArrowBack, MdCheck, MdClose } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, getAllDocuments, updateDocument } from '@/firebase/firestore';
import { BookingDetails } from '@/components/BookingDetailsTable';

const AdminBookingDetails = () => {
  const { user, loading } = useAuth({
    redirectTo: '/admin/auth',
    requiredRole: 'Admin'
  });

  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'disapprove' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Fetch booking and inspections in parallel
        const [doc, inspectionsData] = await Promise.all([
          getDocument('bookings', bookingId),
          getAllDocuments('inspections')
        ]);

        if (!doc) {
          setError('Booking not found');
          return;
        }

        // Determine status
        let status = 'Pending';
        if (doc.bookingStatus) status = 'Approved';
        else if (doc.rejectionReason) status = 'Rejected';

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
          staffName: doc.bookedBy ? `${doc.bookedBy.firstName} ${doc.bookedBy.lastName}` : 'Unknown',
          bookingDate: doc.bookingDate?.toDate ? doc.bookingDate.toDate().toISOString() : doc.bookingDate,
          returnDate: doc.returnDate?.toDate ? doc.returnDate.toDate().toISOString() : doc.returnDate,
          project: doc.project || '',
          destination: doc.destination || '',
          passengers: doc.passengers,
          status: status,
          requestedDate: doc.createdAt?.toDate ? doc.createdAt.toDate().toISOString() : doc.createdAt,
          notes: doc.notes || '',
          approvedBy: doc.approvedBy ? `${doc.approvedBy.firstName} ${doc.approvedBy.lastName}` : null,
          approvalDate: doc.updatedAt?.toDate ? doc.updatedAt.toDate().toISOString() : null,
          rejectionReason: doc.rejectionReason,
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

  const handleApprovalAction = (action: 'approve' | 'disapprove') => {
    setModalAction(action);
    setShowModal(true);
  };

  const confirmApprovalAction = async () => {
    if (!modalAction || !booking) return;

    // Validate rejection reason if rejecting
    if (modalAction === 'disapprove' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const updateData: any = {
        bookingStatus: modalAction === 'approve',
        updatedAt: new Date(),
      };

      if (modalAction === 'approve') {
        updateData.approvedBy = {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Admin',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          role: 'Admin'
        };
        updateData.rejectionReason = null;
      } else {
        updateData.rejectionReason = rejectionReason;
        updateData.approvedBy = null;
      }

      await updateDocument('bookings', bookingId, updateData);

      alert(`Booking ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully!`);

      // Reload page or update state to reflect changes
      window.location.reload();

    } catch (error: any) {
      console.error('Error updating booking:', error);
      alert('Error updating booking: ' + error.message);
    } finally {
      setShowModal(false);
      setModalAction(null);
      setRejectionReason('');
    }
  };

  const cancelApprovalAction = () => {
    setShowModal(false);
    setModalAction(null);
    setRejectionReason('');
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
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
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">{error || "The booking you're looking for doesn't exist."}</p>
            <Link
              href="/admin/bookings"
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
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} />

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
            <div className="flex items-center gap-4">
              <Chip variant={
                booking.status === 'Approved'
                  ? 'success'
                  : booking.status === 'Pending'
                    ? 'pending'
                    : 'error'
              }>
                {booking.status}
              </Chip>

              {/* Approval Actions for Pending Bookings */}
              {booking.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovalAction('approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                  >
                    <MdCheck className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprovalAction('disapprove')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                  >
                    <MdClose className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Information Card */}
        <div className="mb-6">
          <BookingDetailsTable booking={booking} variant="admin" />
        </div>

        {/* Inspection Forms Section - Only show for Approved bookings */}
        {booking.status === 'Approved' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Inspection Forms</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pre-Trip Inspection Form */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Pre-Trip Inspection Form</h3>

                {booking.preInspectionForm === 'Submitted' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-bold text-lg">✓</span>
                      <span className="text-sm font-semibold text-green-900">Submitted</span>
                    </div>
                    <p className="text-xs text-green-700 mb-3">
                      The pre-trip inspection form has been submitted by the staff.
                    </p>
                    <Link
                      href={`/admin/bookings/${booking.id}/inspection?type=pre&view=true`}
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

              {/* Post-Trip Inspection Form */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Post-Trip Inspection Form</h3>

                {booking.postInspectionForm === 'Submitted' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-bold text-lg">✓</span>
                      <span className="text-sm font-semibold text-green-900">Submitted</span>
                    </div>
                    <p className="text-xs text-green-700 mb-3">
                      The post-trip inspection form has been submitted by the staff.
                    </p>
                    <Link
                      href={`/admin/bookings/${booking.id}/inspection?type=post&view=true`}
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
        )}
      </main>

      {/* Confirmation Modal */}
      {showModal && modalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              {modalAction === 'approve'
                ? 'Are you sure you want to approve this booking request? The staff will be notified and can proceed with the booking.'
                : 'Please provide a reason for rejecting this booking request. The staff will be notified of the rejection.'}
            </p>

            {/* Rejection Reason Input */}
            {modalAction === 'disapprove' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="e.g., Vehicle not available on requested dates, insufficient justification, etc."
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmApprovalAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={cancelApprovalAction}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingDetails;
