'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, VehicleInspectionForm, InspectionFormData } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, getAllDocuments } from '@/firebase/firestore';
import { Booking, Inspection } from '@/types';

// Dynamically import PDF button component (client-side only)
const PDFButton = dynamic(() => import('@/components/PDFButton'), {
  ssr: false,
  loading: () => (
    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium" disabled>
      Loading...
    </button>
  ),
});

const AdminInspectionPage = () => {
  const { user, loading: authLoading } = useAuth({
    redirectTo: '/admin/auth',
    requiredRole: 'Admin'
  });

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;

  const typeParam = searchParams.get('type');
  const inspectionType: 'pre' | 'post' | null = typeParam ? (typeParam as 'pre' | 'post') : null;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [hasPreInspection, setHasPreInspection] = useState(false);
  const [hasPostInspection, setHasPostInspection] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfImages, setPdfImages] = useState<{ [key: string]: string }>({});
  const [imagesLoading, setImagesLoading] = useState(false);

  // Fetch booking and inspection data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        setError(null);

        // Fetch booking
        const bookingDoc = await getDocument('bookings', bookingId);
        if (!bookingDoc) {
          setError('Booking not found');
          setDataLoading(false);
          return;
        }

        const typedBooking: Booking = {
          id: bookingDoc.id,
          project: bookingDoc.project || '',
          destination: bookingDoc.destination || '',
          passengers: bookingDoc.passengers || 0,
          bookingStatus: bookingDoc.bookingStatus || false,
          keyCollectionStatus: bookingDoc.keyCollectionStatus || false,
          keyReturnStatus: bookingDoc.keyReturnStatus || false,
          bookingDate: bookingDoc.bookingDate?.toDate ? bookingDoc.bookingDate.toDate() : new Date(),
          returnDate: bookingDoc.returnDate?.toDate ? bookingDoc.returnDate.toDate() : new Date(),
          createdAt: bookingDoc.createdAt?.toDate ? bookingDoc.createdAt.toDate() : new Date(),
          updatedAt: bookingDoc.updatedAt?.toDate ? bookingDoc.updatedAt.toDate() : new Date(),
          managedBy: bookingDoc.managedBy || null,
          approvedBy: bookingDoc.approvedBy || null,
          bookedBy: bookingDoc.bookedBy || null,
          vehicle: bookingDoc.vehicle,
          rejectionReason: bookingDoc.rejectionReason
        };

        setBooking(typedBooking);

        // Fetch ALL inspections for this booking to check which exist
        const allInspections = await getAllDocuments('inspections');
        const preExists = allInspections.some(
          (insp: any) => insp.booking?.id === bookingId && insp.inspectionFormType === 'pre'
        );
        const postExists = allInspections.some(
          (insp: any) => insp.booking?.id === bookingId && insp.inspectionFormType === 'post'
        );
        setHasPreInspection(preExists);
        setHasPostInspection(postExists);

        // If inspection type is specified, fetch that specific inspection
        if (inspectionType) {
          const foundInspection = allInspections.find(
            (insp: any) =>
              insp.booking?.id === bookingId &&
              insp.inspectionFormType === inspectionType
          );

          if (foundInspection) {
            const typedInspection: Inspection = {
              id: foundInspection.id,
              inspectionFormType: foundInspection.inspectionFormType,
              inspectionDate: foundInspection.inspectionDate?.toDate
                ? foundInspection.inspectionDate.toDate()
                : new Date(),
              nextVehicleServiceDate: foundInspection.nextVehicleServiceDate?.toDate
                ? foundInspection.nextVehicleServiceDate.toDate()
                : new Date(),
              vehicleMilleage: foundInspection.vehicleMilleage || 0,
              parts: foundInspection.parts || {},
              images: foundInspection.images || {},
              createdAt: foundInspection.createdAt?.toDate
                ? foundInspection.createdAt.toDate()
                : new Date(),
              updatedAt: foundInspection.updatedAt?.toDate
                ? foundInspection.updatedAt.toDate()
                : new Date(),
              booking: foundInspection.booking
            };

            setInspection(typedInspection);

            // Convert Firebase Storage URLs to base64 for PDF
            if (typedInspection.images) {
              setImagesLoading(true);
              const convertedImages: { [key: string]: string } = {};

              for (const [key, url] of Object.entries(typedInspection.images)) {
                if (url && typeof url === 'string') {
                  try {
                    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
                    if (response.ok) {
                      const data = await response.json();
                      convertedImages[key] = data.base64;
                    }
                  } catch (err) {
                    console.error(`Failed to convert image ${key}:`, err);
                  }
                }
              }

              setPdfImages(convertedImages);
              setImagesLoading(false);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, bookingId, inspectionType]);

  if (authLoading || !user) return null;

  const handleCancel = () => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  // Dummy submit handler (should never be called since it's read-only)
  const handleSubmit = (data: InspectionFormData) => {
    console.log('Form is read-only, submission should not happen');
  };

  // Show loading state
  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading inspection data...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error if booking not found
  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
            <p className="text-gray-600 mt-2">{error || 'Booking not found'}</p>
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

  // Show selection screen if no type parameter
  if (!inspectionType) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
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
                Booking ID: {bookingId} • Staff: {booking.bookedBy?.firstName} {booking.bookedBy?.lastName}
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
                  {hasPreInspection ? (
                    <Link
                      href={`/admin/bookings/${bookingId}/inspection?type=pre`}
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
                  {hasPostInspection ? (
                    <Link
                      href={`/admin/bookings/${bookingId}/inspection?type=post`}
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
                    You can view inspection forms that have been submitted by staff. All forms are read-only for admin review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show message if form hasn't been submitted yet
  if (!inspection) {
    const formName = inspectionType === 'pre' ? 'Pre-Trip' : 'Post-Trip';

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Form Not Submitted</h1>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              The {formName} inspection form has not been submitted yet. Only submitted forms can be viewed.
            </p>
            <Link
              href={`/admin/bookings/${bookingId}/inspection`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Form Selection
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Prepare PDF data from inspection - map Firestore structure to PDF structure
  const pdfData = {
    inspectionDate: inspection.inspectionDate.toLocaleDateString('en-MY'),
    vehicleRegNo: booking.vehicle?.plateNumber || '',
    vehicleModel: `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim(),
    project: booking.project,
    currentMileage: `${inspection.vehicleMilleage} km`,
    nextServiceDate: inspection.nextVehicleServiceDate.toLocaleDateString('en-MY'),
    inspectionType: inspectionType,
    inspectionItems: {
      remoteControl: { functional: inspection.parts.remoteControl.functionalStatus, broken: !inspection.parts.remoteControl.functionalStatus, remark: inspection.parts.remoteControl.remark || '' },
      brakes: { functional: inspection.parts.brakes.functionalStatus, broken: !inspection.parts.brakes.functionalStatus, remark: inspection.parts.brakes.remark || '' },
      steering: { functional: inspection.parts.steering.functionalStatus, broken: !inspection.parts.steering.functionalStatus, remark: inspection.parts.steering.remark || '' },
      autoManualTransaxle: { functional: inspection.parts.operation.functionalStatus, broken: !inspection.parts.operation.functionalStatus, remark: inspection.parts.operation.remark || '' },
      engineAccelerates: { functional: inspection.parts.engine.functionalStatus, broken: !inspection.parts.engine.functionalStatus, remark: inspection.parts.engine.remark || '' },
      bodyPanelInspection: { functional: inspection.parts.panelInspection.functionalStatus, broken: !inspection.parts.panelInspection.functionalStatus, remark: inspection.parts.panelInspection.remark || '' },
      bumperInspection: { functional: inspection.parts.bumper.functionalStatus, broken: !inspection.parts.bumper.functionalStatus, remark: inspection.parts.bumper.remark || '' },
      doorsInspection: { functional: inspection.parts.doors.functionalStatus, broken: !inspection.parts.doors.functionalStatus, remark: inspection.parts.doors.remark || '' },
      roofInspection: { functional: inspection.parts.roof.functionalStatus, broken: !inspection.parts.roof.functionalStatus, remark: inspection.parts.roof.remark || '' },
      exteriorLights: { functional: inspection.parts.exteriorLights.functionalStatus, broken: !inspection.parts.exteriorLights.functionalStatus, remark: inspection.parts.exteriorLights.remark || '' },
      safetyBelts: { functional: inspection.parts.safetyBelts.functionalStatus, broken: !inspection.parts.safetyBelts.functionalStatus, remark: inspection.parts.safetyBelts.remark || '' },
      airConditioning: { functional: inspection.parts.airConditioning.functionalStatus, broken: !inspection.parts.airConditioning.functionalStatus, remark: inspection.parts.airConditioning.remark || '' },
      radio: { functional: inspection.parts.radio.functionalStatus, broken: !inspection.parts.radio.functionalStatus, remark: inspection.parts.radio.remark || '' },
      navigationSystem: { functional: inspection.parts.navigationSystem.functionalStatus, broken: !inspection.parts.navigationSystem.functionalStatus, remark: inspection.parts.navigationSystem.remark || '' },
      tiresWheels: { functional: inspection.parts.tires.functionalStatus, broken: !inspection.parts.tires.functionalStatus, remark: inspection.parts.tires.remark || '' },
    },
    staffName: `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim(),
    bookingId: bookingId,
    vehicleImages: {
      left: pdfImages.vehicleLeft || null,
      right: pdfImages.vehicleRight || null,
      front: pdfImages.vehicleFront || null,
      rear: pdfImages.vehicleRear || null,
      top: null,
      frontTyre: pdfImages.tyreFront || null,
      rearTyre: pdfImages.tyreRear || null,
    },
    staffSubmittedDate: inspection.createdAt.toLocaleDateString('en-MY'),
    // Admin who approved the booking
    adminName: booking.approvedBy ? `${booking.approvedBy.firstName || ''} ${booking.approvedBy.lastName || ''}`.trim() : undefined,
    adminApprovedDate: booking.approvedBy && booking.updatedAt ? booking.updatedAt.toLocaleDateString('en-MY') : undefined,
    // Receptionist who managed the keys
    custodianName: booking.managedBy ? `${booking.managedBy.firstName || ''} ${booking.managedBy.lastName || ''}`.trim() : undefined,
    custodianReceivedDate: booking.managedBy && booking.keyCollectionStatus ? booking.updatedAt.toLocaleDateString('en-MY') : undefined,
  };

  // Prepare initial form data
  const initialData = {
    inspectionType: inspectionType,
    inspectionDate: inspection.inspectionDate.toISOString().split('T')[0],
    vehicleRegNo: booking.vehicle?.plateNumber || '',
    vehicleModel: `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim(),
    project: booking.project,
    currentMileage: inspection.vehicleMilleage.toString(),
    nextServiceDate: inspection.nextVehicleServiceDate.toISOString().split('T')[0],
    inspectionItems: [
      { name: 'Remote control', functional: inspection.parts.remoteControl.functionalStatus, broken: !inspection.parts.remoteControl.functionalStatus, remark: inspection.parts.remoteControl.remark || '' },
      { name: 'Brakes', functional: inspection.parts.brakes.functionalStatus, broken: !inspection.parts.brakes.functionalStatus, remark: inspection.parts.brakes.remark || '' },
      { name: 'Steering', functional: inspection.parts.steering.functionalStatus, broken: !inspection.parts.steering.functionalStatus, remark: inspection.parts.steering.remark || '' },
      { name: 'Auto/Manual /Transaxle Operation', functional: inspection.parts.operation.functionalStatus, broken: !inspection.parts.operation.functionalStatus, remark: inspection.parts.operation.remark || '' },
      { name: 'Engine Accelerates and Cruises', functional: inspection.parts.engine.functionalStatus, broken: !inspection.parts.engine.functionalStatus, remark: inspection.parts.engine.remark || '' },
      { name: 'Body Panel Inspection', functional: inspection.parts.panelInspection.functionalStatus, broken: !inspection.parts.panelInspection.functionalStatus, remark: inspection.parts.panelInspection.remark || '' },
      { name: 'Bumper Inspection (Front & Back)', functional: inspection.parts.bumper.functionalStatus, broken: !inspection.parts.bumper.functionalStatus, remark: inspection.parts.bumper.remark || '' },
      { name: 'Doors Inspection', functional: inspection.parts.doors.functionalStatus, broken: !inspection.parts.doors.functionalStatus, remark: inspection.parts.doors.remark || '' },
      { name: 'Roof Inspection', functional: inspection.parts.roof.functionalStatus, broken: !inspection.parts.roof.functionalStatus, remark: inspection.parts.roof.remark || '' },
      { name: 'Exterior Lights (Back/Side/Front)', functional: inspection.parts.exteriorLights.functionalStatus, broken: !inspection.parts.exteriorLights.functionalStatus, remark: inspection.parts.exteriorLights.remark || '' },
      { name: 'Safety Belts', functional: inspection.parts.safetyBelts.functionalStatus, broken: !inspection.parts.safetyBelts.functionalStatus, remark: inspection.parts.safetyBelts.remark || '' },
      { name: 'Air Conditioning System', functional: inspection.parts.airConditioning.functionalStatus, broken: !inspection.parts.airConditioning.functionalStatus, remark: inspection.parts.airConditioning.remark || '' },
      { name: 'Radio', functional: inspection.parts.radio.functionalStatus, broken: !inspection.parts.radio.functionalStatus, remark: inspection.parts.radio.remark || '' },
      { name: 'Navigation System', functional: inspection.parts.navigationSystem.functionalStatus, broken: !inspection.parts.navigationSystem.functionalStatus, remark: inspection.parts.navigationSystem.remark || '' },
      { name: 'Tires / Wheels Condition', functional: inspection.parts.tires.functionalStatus, broken: !inspection.parts.tires.functionalStatus, remark: inspection.parts.tires.remark || '' },
    ],
    vehicleImages: {
      left: inspection.images.vehicleLeft || null,
      right: inspection.images.vehicleRight || null,
      front: inspection.images.vehicleFront || null,
      rear: inspection.images.vehicleRear || null,
      top: null,
      frontTyre: inspection.images.tyreFront || null,
      rearTyre: inspection.images.tyreRear || null,
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

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
                {inspectionType === 'pre' ? 'Pre-Trip' : 'Post-Trip'} Inspection
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Booking ID: {bookingId} • Staff: {booking.bookedBy?.firstName} {booking.bookedBy?.lastName}
              </p>
            </div>

            {/* Print PDF Button */}
            {imagesLoading ? (
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading images...
              </button>
            ) : (
              <PDFButton
                data={pdfData}
                fileName={`inspection-${inspectionType}-${bookingId}.pdf`}
              />
            )}
          </div>
        </div>

        {/* Read-only Inspection Form Component */}
        <VehicleInspectionForm
          bookingId={bookingId}
          inspectionType={inspectionType}
          isReadOnly={true}
          staffName={`${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim()}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          autoFillData={{
            plateNumber: booking.vehicle?.plateNumber || '',
            vehicle: `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim(),
            project: booking.project,
          }}
          initialData={initialData}
        />
      </main>
    </div>
  );
};

export default AdminInspectionPage;
