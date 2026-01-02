'use client';

import React from 'react';
import { Sidebar, VehicleInspectionForm } from '@/components';
import { adminNavLinks } from '@/constant';
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
    staffName: 'Ahmad Zaki',
    status: 'Approved',
  },
  'BK-002': {
    id: 'BK-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    project: 'Sunway Development Project',
    staffName: 'Sarah Lee',
    status: 'Approved',
  },
  'BK-003': {
    id: 'BK-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'GHI 9012',
    project: 'Johor Bahru Mall Renovation',
    staffName: 'Kumar Rajan',
    status: 'Approved',
  },
};

const AdminInspectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = params.id as string;
  const inspectionType = (searchParams.get('type') as 'pre' | 'post') || 'pre';
  const viewMode = searchParams.get('view') === 'true';

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

  // Prepare PDF data from form (for view mode)
  const pdfData = {
    inspectionDate: new Date().toLocaleDateString('en-MY'),
    vehicleRegNo: booking.plateNumber,
    vehicleModel: booking.vehicle,
    project: booking.project,
    currentMileage: '50000 km',
    nextServiceDate: '2025-03-01',
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
    staffName: booking.staffName,
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
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} />

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
                {inspectionType === 'pre' ? 'Pre-Trip' : 'Post-Trip'} Inspection Form
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Booking ID: {bookingId} | Staff: {booking.staffName}
              </p>
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

        {/* Inspection Form Component - Admin View is Read-Only */}
        <VehicleInspectionForm
          bookingId={bookingId}
          inspectionType={inspectionType}
          isReadOnly={true}
          vehicleInfo={{
            vehicleModel: booking.vehicle,
            plateNumber: booking.plateNumber,
            project: booking.project,
          }}
        />
      </main>
    </div>
  );
};

export default AdminInspectionPage;
