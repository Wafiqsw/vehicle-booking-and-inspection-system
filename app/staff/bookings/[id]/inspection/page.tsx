'use client';

import React from 'react';
import { Sidebar, VehicleInspectionForm, InspectionFormData } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import PDF button component (client-side only)
const PDFButton = dynamic(() => import('@/components/PDFButton'), {
  ssr: false,
  loading: () => (
    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium" disabled>
      Loading...
    </button>
  ),
});

// Mock booking data
const bookingData: { [key: string]: any } = {
  'BK-001': {
    id: 'BK-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    project: 'Highland Towers Construction',
    status: 'Approved',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Pending',
    keyCollectionStatus: 'Collected',
  },
  'BK-002': {
    id: 'BK-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    project: 'Sunway Development Project',
    status: 'Pending',
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
  },
  'BK-003': {
    id: 'BK-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'GHI 9012',
    project: 'Johor Bahru Mall Renovation',
    status: 'Approved',
    preInspectionForm: 'Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Ready to Collect',
  },
  'BK-004': {
    id: 'BK-004',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'JKL 3456',
    project: 'Penang Bridge Maintenance',
    status: 'Approved',
    preInspectionForm: 'Pending',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
  },
  'BK-005': {
    id: 'BK-005',
    vehicle: 'Mitsubishi Triton',
    plateNumber: 'MNO 7890',
    project: 'Melaka Heritage Site Restoration',
    status: 'Pending',
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
  },
};

const InspectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const booking = bookingData[bookingId];

  const typeParam = searchParams.get('type') || 'pre';
  const viewMode = searchParams.get('view') === 'true';

  const inspectionType: 'pre' | 'post' = typeParam as 'pre' | 'post';

  // Check access permissions based on inspection type and form status
  const canAccessPreInspection = () => {
    if (!booking) return false;
    if (viewMode && booking.preInspectionForm === 'Submitted') return true;
    if (!viewMode && booking.preInspectionForm === 'Pending') return true;
    return false;
  };

  const canAccessPostInspection = () => {
    if (!booking) return false;
    if (viewMode && booking.postInspectionForm === 'Submitted') return true;
    if (!viewMode && booking.postInspectionForm === 'Pending') return true;
    return false;
  };

  const hasAccess = inspectionType === 'pre' ? canAccessPreInspection() : canAccessPostInspection();

  const handleSubmit = (data: InspectionFormData) => {
    console.log('Inspection Form Data:', data);
    alert(`${inspectionType === 'pre' ? 'Pre' : 'Post'}-Trip Inspection form submitted successfully!`);
    router.push(`/staff/bookings/${bookingId}`);
  };

  const handleCancel = () => {
    router.push(`/staff/bookings/${bookingId}`);
  };

  // Show error if booking not found
  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're trying to access doesn't exist.</p>
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

  // Show error if user doesn't have access
  if (!hasAccess) {
    const getErrorMessage = () => {
      if (inspectionType === 'pre') {
        if (viewMode) {
          return 'The pre-trip inspection form has not been submitted yet. You can only view submitted forms.';
        } else {
          if (booking.preInspectionForm === 'Submitted') {
            return 'The pre-trip inspection form has already been submitted. You cannot edit it.';
          } else if (booking.preInspectionForm === 'Not Submitted') {
            return 'You cannot submit the pre-trip inspection form yet. Please wait for admin to approve your booking request.';
          }
        }
      } else {
        if (viewMode) {
          return 'The post-trip inspection form has not been submitted yet. You can only view submitted forms.';
        } else {
          if (booking.postInspectionForm === 'Submitted') {
            return 'The post-trip inspection form has already been submitted. You cannot edit it.';
          } else if (booking.postInspectionForm === 'Not Submitted') {
            return 'You cannot submit the post-trip inspection form yet. Please collect the vehicle keys first.';
          }
        }
      }
      return 'You do not have permission to access this inspection form.';
    };

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">{getErrorMessage()}</p>
            <Link
              href={`/staff/bookings/${bookingId}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Booking Details
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Prepare PDF data from form (for view mode)
  const pdfData = {
    inspectionDate: new Date().toLocaleDateString('en-MY'),
    vehicleRegNo: booking.plateNumber,
    vehicleModel: booking.vehicle,
    project: booking.project,
    currentMileage: '50000 km', // Mock data - should come from actual form
    nextServiceDate: '2025-03-01', // Mock data - should come from actual form
    inspectionType: inspectionType,
    inspectionItems: {
      remoteControl: { functional: true, broken: false, remark: '' },
      brakes: { functional: true, broken: false, remark: '' },
      steering: { functional: true, broken: false, remark: '' },
      autoManualTransaxle: { functional: true, broken: false, remark: '' },
      engineAccelerates: { functional: true, broken: false, remark: '' },
      bodyPanelInspection: { functional: true, broken: false, remark: '' },
      bumperInspection: { functional: true, broken: false, remark: '' },
      doorsInspection: { functional: true, broken: false, remark: '' },
      roofInspection: { functional: true, broken: false, remark: '' },
      exteriorLights: { functional: true, broken: false, remark: '' },
      safetyBelts: { functional: true, broken: false, remark: '' },
      airConditioning: { functional: true, broken: false, remark: '' },
      radio: { functional: true, broken: false, remark: '' },
      navigationSystem: { functional: true, broken: false, remark: '' },
      tiresWheels: { functional: true, broken: false, remark: '' },
    },
    staffName: 'Staff Member', // Mock data - should come from auth
    bookingId: bookingId,
    vehicleImages: {
      left: null,
      right: null,
      front: null,
      rear: null,
      top: null,
      frontTyre: null,
      rearTyre: null,
    },
    adminName: 'John Doe',
    adminApprovedDate: '28 Dec 2024',
    custodianName: 'Sarah Ahmad',
    custodianReceivedDate: '29 Dec 2024',
    staffSubmittedDate: '27 Dec 2024',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <MdArrowBack className="w-5 h-5" />
            Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Vehicle Inspection
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">Booking ID: {bookingId}</p>
            </div>

            {/* Print PDF Button - Only show in view mode */}
            {viewMode && (
              <PDFButton
                data={pdfData}
                fileName={`inspection-${inspectionType}-${bookingId}.pdf`}
              />
            )}
          </div>
        </div>

        {/* Inspection Form Component */}
        <VehicleInspectionForm
          bookingId={bookingId}
          inspectionType={inspectionType}
          isReadOnly={viewMode}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          autoFillData={{
            plateNumber: booking.plateNumber,
            vehicle: booking.vehicle,
            project: booking.project,
          }}
        />
      </main>
    </div>
  );
};

export default InspectionPage;
