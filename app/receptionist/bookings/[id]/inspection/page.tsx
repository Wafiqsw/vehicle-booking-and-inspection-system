'use client';

import React, { useState } from 'react';
import { Sidebar, VehicleInspectionForm, InspectionFormData } from '@/components';
import { receptionistNavLinks } from '@/constant';
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

// Mock booking data with staff names
const bookingData: { [key: string]: any } = {
  'BK-001': {
    id: 'BK-001',
    staffName: 'Ahmad Zaki',
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
    staffName: 'Sarah Lee',
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
    staffName: 'Kumar Raj',
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
    staffName: 'Fatimah Zahra',
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
    staffName: 'David Tan',
    vehicle: 'Mitsubishi Triton',
    plateNumber: 'MNO 7890',
    project: 'Melaka Heritage Site Restoration',
    status: 'Pending',
    preInspectionForm: 'Not Submitted',
    postInspectionForm: 'Not Submitted',
    keyCollectionStatus: 'Not Collected',
  },
};

const ReceptionistInspectionView = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const booking = bookingData[bookingId];

  const typeParam = searchParams.get('type');
  const inspectionType: 'pre' | 'post' | null = typeParam ? (typeParam as 'pre' | 'post') : null;

  // Receptionist can only view submitted forms
  const canViewForm = () => {
    if (!booking) return false;
    if (inspectionType === 'pre' && booking.preInspectionForm === 'Submitted') return true;
    if (inspectionType === 'post' && booking.postInspectionForm === 'Submitted') return true;
    return false;
  };

  const hasAccess = canViewForm();

  const handleCancel = () => {
    router.push('/receptionist/bookings');
  };

  // Dummy submit handler (should never be called since it's read-only)
  const handleSubmit = (data: InspectionFormData) => {
    console.log('Form is read-only, submission should not happen');
  };

  // Show error if booking not found
  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're trying to access doesn't exist.</p>
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

  // Show selection screen if no type parameter
  if (!inspectionType) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
            >
              <MdArrowBack className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Select Inspection Form
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Booking ID: {bookingId} • Staff: {booking.staffName}
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Inspection Forms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pre-Trip Form Card */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Pre-Trip Inspection</h3>
                  <p className="text-sm text-gray-600 mb-4">View the vehicle inspection form completed before the trip.</p>
                  {booking.preInspectionForm === 'Submitted' ? (
                    <Link
                      href={`/receptionist/bookings/${bookingId}/inspection?type=pre`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      View Pre-Trip Form
                    </Link>
                  ) : (
                    <div className="text-center">
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                      >
                        Not Submitted
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Form has not been submitted yet</p>
                    </div>
                  )}
                </div>

                {/* Post-Trip Form Card */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Post-Trip Inspection</h3>
                  <p className="text-sm text-gray-600 mb-4">View the vehicle inspection form completed after the trip.</p>
                  {booking.postInspectionForm === 'Submitted' ? (
                    <Link
                      href={`/receptionist/bookings/${bookingId}/inspection?type=post`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      View Post-Trip Form
                    </Link>
                  ) : (
                    <div className="text-center">
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                      >
                        Not Submitted
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Form has not been submitted yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">i</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Information</h3>
                  <p className="text-sm text-blue-800">
                    You can only view inspection forms that have been submitted by the staff member.
                    Forms that have not been submitted yet will be available once the staff completes them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error if form hasn't been submitted yet
  if (!hasAccess) {
    const getErrorMessage = () => {
      if (inspectionType === 'pre') {
        return 'The pre-trip inspection form has not been submitted yet. Only submitted forms can be viewed.';
      } else {
        return 'The post-trip inspection form has not been submitted yet. Only submitted forms can be viewed.';
      }
    };

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Form Not Available</h1>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">{getErrorMessage()}</p>
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

  // Prepare PDF data from form - Demo with completed inspection data
  const pdfData = {
    inspectionDate: new Date().toLocaleDateString('en-MY'),
    vehicleRegNo: booking.plateNumber,
    vehicleModel: booking.vehicle,
    project: booking.project,
    currentMileage: '52,350 km',
    nextServiceDate: '15 March 2025',
    inspectionType: inspectionType!,
    inspectionItems: {
      remoteControl: { functional: true, broken: false, remark: 'Working properly' },
      brakes: { functional: true, broken: false, remark: 'Brake pads at 60%' },
      steering: { functional: true, broken: false, remark: 'Smooth operation' },
      autoManualTransaxle: { functional: true, broken: false, remark: 'No issues detected' },
      engineAccelerates: { functional: true, broken: false, remark: 'Engine runs smoothly' },
      bodyPanelInspection: { functional: false, broken: true, remark: 'Minor scratch on rear left panel' },
      bumperInspection: { functional: true, broken: false, remark: 'No damage' },
      doorsInspection: { functional: true, broken: false, remark: 'All doors lock/unlock properly' },
      roofInspection: { functional: true, broken: false, remark: 'No leaks or damage' },
      exteriorLights: { functional: false, broken: true, remark: 'Right rear light bulb needs replacement' },
      safetyBelts: { functional: true, broken: false, remark: 'All belts functional' },
      airConditioning: { functional: true, broken: false, remark: 'Cooling effectively' },
      radio: { functional: true, broken: false, remark: 'All speakers working' },
      navigationSystem: { functional: true, broken: false, remark: 'GPS signal strong' },
      tiresWheels: { functional: true, broken: false, remark: 'Tire pressure optimal, tread depth good' },
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
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} />

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
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Booking ID: {bookingId} • Staff: {booking.staffName}
              </p>
            </div>

            {/* Print PDF Button */}
            <PDFButton
              data={pdfData}
              fileName={`inspection-${inspectionType}-${bookingId}.pdf`}
            />
          </div>
        </div>

        {/* Read-only Inspection Form Component */}
        <VehicleInspectionForm
          bookingId={bookingId}
          inspectionType={inspectionType}
          isReadOnly={true}
          staffName={booking.staffName}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          autoFillData={{
            plateNumber: booking.plateNumber,
            vehicle: booking.vehicle,
            project: booking.project,
          }}
          initialData={{
            inspectionType: inspectionType,
            inspectionDate: new Date().toISOString().split('T')[0],
            vehicleRegNo: booking.plateNumber,
            vehicleModel: booking.vehicle,
            project: booking.project,
            currentMileage: '52350',
            nextServiceDate: '2025-03-15',
            inspectionItems: [
              { name: 'Remote control', functional: true, broken: false, remark: 'Working properly' },
              { name: 'Brakes', functional: true, broken: false, remark: 'Brake pads at 60%' },
              { name: 'Steering', functional: true, broken: false, remark: 'Smooth operation' },
              { name: 'Auto/Manual /Transaxle Operation', functional: true, broken: false, remark: 'No issues detected' },
              { name: 'Engine Accelerates and Cruises', functional: true, broken: false, remark: 'Engine runs smoothly' },
              { name: 'Body Panel Inspection', functional: false, broken: true, remark: 'Minor scratch on rear left panel' },
              { name: 'Bumper Inspection (Front & Back)', functional: true, broken: false, remark: 'No damage' },
              { name: 'Doors Inspection', functional: true, broken: false, remark: 'All doors lock/unlock properly' },
              { name: 'Roof Inspection', functional: true, broken: false, remark: 'No leaks or damage' },
              { name: 'Exterior Lights (Back/Side/Front)', functional: false, broken: true, remark: 'Right rear light bulb needs replacement' },
              { name: 'Safety Belts', functional: true, broken: false, remark: 'All belts functional' },
              { name: 'Air Conditioning System', functional: true, broken: false, remark: 'Cooling effectively' },
              { name: 'Radio', functional: true, broken: false, remark: 'All speakers working' },
              { name: 'Navigation System', functional: true, broken: false, remark: 'GPS signal strong' },
              { name: 'Tires / Wheels Condition', functional: true, broken: false, remark: 'Tire pressure optimal, tread depth good' },
            ],
            vehicleImages: {
              left: null,
              right: null,
              front: null,
              rear: null,
              top: null,
              frontTyre: null,
              rearTyre: null,
            }
          }}
        />
      </main>
    </div>
  );
};

export default ReceptionistInspectionView;
