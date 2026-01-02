'use client';

import React from 'react';
import { Sidebar, Chip, BookingDetailsTable } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Define the booking type to match the Booking interface from BookingTable
interface DetailedBooking {
  id: string;
  vehicleId?: string;
  vehicle: string;
  plateNumber: string;
  staffName?: string;
  bookingDate: string;
  returnDate: string;
  project: string;
  purpose?: string;
  destination?: string;
  passengers?: number;
  status?: string;
  requestedDate: string;
  approvedBy?: string | null;
  approvalDate?: string | null;
  preInspectionForm: string;
  postInspectionForm: string;
  keyCollectionStatus: string;
  keyReturnStatus: string;
  rejectionReason?: string;
}

// Mock booking data
const bookingData: { [key: string]: DetailedBooking } = {
  'BK-001': {
    id: 'BK-001',
    vehicleId: 'VH-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    staffName: 'Ahmad Zaki',
    bookingDate: '2025-01-05',
    returnDate: '2025-01-06',
    project: 'Highland Towers Construction',
    purpose: 'Site Visit',
    destination: 'Kuala Lumpur',
    passengers: 3,
    status: 'Approved',
    requestedDate: '2025-01-02',
    approvedBy: 'Admin',
    approvalDate: '2025-01-03',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
  'BK-002': {
    id: 'BK-002',
    vehicleId: 'VH-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    staffName: 'Sarah Lee',
    bookingDate: '2025-01-08',
    returnDate: '2025-01-09',
    project: 'Sunway Development Project',
    purpose: 'Client Meeting',
    destination: 'Selangor',
    passengers: 2,
    status: 'Approved',
    requestedDate: '2025-01-03',
    approvedBy: 'Admin',
    approvalDate: '2025-01-04',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Pending'
  },
  'BK-003': {
    id: 'BK-003',
    vehicleId: 'VH-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'GHI 9012',
    staffName: 'Kumar Rajan',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-11',
    project: 'Johor Bahru Mall Renovation',
    purpose: 'Material Delivery',
    destination: 'Johor',
    passengers: 2,
    status: 'Approved',
    requestedDate: '2025-01-04',
    approvedBy: 'Admin',
    approvalDate: '2025-01-05',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Submitted',
    keyCollectionStatus: 'Collected',
    keyReturnStatus: 'Returned'
  },
  'BK-006': {
    id: 'BK-006',
    vehicleId: 'VH-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    staffName: 'Ahmad Zaki',
    bookingDate: '2025-01-20',
    returnDate: '2025-01-22',
    project: 'Highland Towers Construction',
    purpose: 'Site Visit',
    destination: 'Kuala Lumpur',
    passengers: 3,
    status: 'Pending',
    requestedDate: '2025-01-15',
    approvedBy: null,
    approvalDate: null,
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
  'BK-007': {
    id: 'BK-007',
    vehicleId: 'VH-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    staffName: 'Sarah Lee',
    bookingDate: '2025-01-18',
    returnDate: '2025-01-19',
    project: 'Sunway Development Project',
    purpose: 'Client Meeting',
    destination: 'Selangor',
    passengers: 2,
    status: 'Pending',
    requestedDate: '2025-01-14',
    approvedBy: null,
    approvalDate: null,
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  },
  'BK-008': {
    id: 'BK-008',
    vehicleId: 'VH-004',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'JKL 3456',
    staffName: 'Fatimah Zahra',
    bookingDate: '2025-01-15',
    returnDate: '2025-01-16',
    project: 'Penang Bridge Maintenance',
    purpose: 'Site Inspection',
    destination: 'Penang',
    passengers: 4,
    status: 'Rejected',
    requestedDate: '2025-01-10',
    approvedBy: 'Admin',
    approvalDate: '2025-01-11',
    rejectionReason: 'Vehicle not available on requested dates.',
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
    keyReturnStatus: 'Pending'
  }
};

const AdminBookingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const booking = bookingData[bookingId];

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're looking for doesn't exist.</p>
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
    </div>
  );
};

export default AdminBookingDetails;
