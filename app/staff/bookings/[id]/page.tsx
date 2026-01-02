'use client';

import React, { useState } from 'react';
import { Sidebar, Chip, BookingDetailsTable } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock booking data
const bookingData: { [key: string]: any } = {
  'BK-001': {
    id: 'BK-001',
    vehicleId: 'VH-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    bookingDate: '2025-01-05',
    returnDate: '2025-01-06',
    project: 'Highland Towers Construction',
    purpose: 'Site Visit',
    destination: 'Kuala Lumpur',
    passengers: 3,
    status: 'Approved',
    requestedDate: '2025-01-02',
    notes: 'Need vehicle for client site visit and equipment delivery.',
    approvedBy: 'Admin',
    approvalDate: '2025-01-03',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Pending',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Pending'
  },
  'BK-002': {
    id: 'BK-002',
    vehicleId: 'VH-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    bookingDate: '2025-01-08',
    returnDate: '2025-01-09',
    project: 'Sunway Development Project',
    purpose: 'Client Meeting',
    destination: 'Selangor',
    passengers: 2,
    status: 'Pending',
    requestedDate: '2025-01-03',
    notes: 'Meeting with potential client to discuss new project.',
    approvedBy: null,
    approvalDate: null,
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Not Returned'
  },
  'BK-003': {
    id: 'BK-003',
    vehicleId: 'VH-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'GHI 9012',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-11',
    project: 'Johor Bahru Mall Renovation',
    purpose: 'Material Delivery',
    destination: 'Johor',
    passengers: 2,
    status: 'Approved',
    requestedDate: '2025-01-04',
    notes: 'Delivery of construction materials to site.',
    approvedBy: 'Admin',
    approvalDate: '2025-01-05',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Ready to Collect',
    keyReturnStatus: 'Not Returned'
  },
  'BK-004': {
    id: 'BK-004',
    vehicleId: 'VH-004',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'JKL 3456',
    bookingDate: '2025-01-12',
    returnDate: '2025-01-13',
    project: 'Penang Bridge Maintenance',
    purpose: 'Site Inspection',
    destination: 'Penang',
    passengers: 4,
    status: 'Approved',
    requestedDate: '2025-01-05',
    notes: 'Routine site inspection and safety audit.',
    approvedBy: 'Admin',
    approvalDate: '2025-01-06',
    preInspectionForm: 'Pending',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Not Returned'
  },
  'BK-005': {
    id: 'BK-005',
    vehicleId: 'VH-005',
    vehicle: 'Mitsubishi Triton',
    plateNumber: 'MNO 7890',
    bookingDate: '2025-01-15',
    returnDate: '2025-01-16',
    project: 'Melaka Heritage Site Restoration',
    purpose: 'Equipment Transport',
    destination: 'Melaka',
    passengers: 1,
    status: 'Pending',
    requestedDate: '2025-01-06',
    notes: 'Transport heavy equipment to new site location.',
    approvedBy: null,
    approvalDate: null,
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Not Returned'
  }
};

const BookingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const booking = bookingData[bookingId];
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelBooking = () => {
    // Here you would typically make an API call to cancel the booking
    console.log('Cancelling booking:', bookingId);
    alert('Booking cancelled successfully!');
    router.push('/staff/bookings');
  };

  const canEdit = booking?.status === 'Pending';
  const canCancelBooking = booking?.keyCollectionStatus === 'Not Collected';

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're looking for doesn't exist.</p>
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
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} />

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
                : booking.status === 'Pending'
                ? 'pending'
                : 'error'
            }>
              {booking.status}
            </Chip>
          </div>
        </div>

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

export default BookingDetails;
