'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, VehicleInspectionForm, InspectionFormData } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, getAllDocuments, createDocument } from '@/firebase/firestore';
import { Booking, Inspection, PartInspection } from '@/types';

// Dynamically import PDF button component (client-side only)
const PDFButton = dynamic(() => import('@/components/PDFButton'), {
  ssr: false,
  loading: () => (
    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium" disabled>
      Loading...
    </button>
  ),
});

const InspectionPage = () => {
  // Protect this route - only allow Staff users
  const { user, loading: authLoading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Admin', 'Receptionist']
  });

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;

  const typeParam = searchParams.get('type') || 'pre';
  const viewMode = searchParams.get('view') === 'true';
  const inspectionType: 'pre' | 'post' = typeParam as 'pre' | 'post';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
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

        // Fetch booking
        const bookingDoc = await getDocument('bookings', bookingId);

        if (!bookingDoc) {
          setError('Booking not found');
          return;
        }

        // Map to Booking type
        const typedBooking: Booking = {
          id: bookingDoc.id,
          project: bookingDoc.project || '',
          destination: bookingDoc.destination || '',
          passengers: bookingDoc.passengers || 0,
          bookingStatus: bookingDoc.bookingStatus || false,
          keyCollectionStatus: bookingDoc.keyCollectionStatus || false,
          keyReturnStatus: bookingDoc.keyReturnStatus || false,
          bookingDate: bookingDoc.bookingDate?.toDate ? bookingDoc.bookingDate.toDate() : new Date(bookingDoc.bookingDate),
          returnDate: bookingDoc.returnDate?.toDate ? bookingDoc.returnDate.toDate() : new Date(bookingDoc.returnDate),
          createdAt: bookingDoc.createdAt?.toDate ? bookingDoc.createdAt.toDate() : new Date(),
          updatedAt: bookingDoc.updatedAt?.toDate ? bookingDoc.updatedAt.toDate() : new Date(),
          managedBy: bookingDoc.managedBy || null,
          approvedBy: bookingDoc.approvedBy || null,
          bookedBy: bookingDoc.bookedBy || null,
          vehicle: bookingDoc.vehicle || null,
          rejectionReason: bookingDoc.rejectionReason
        };

        setBooking(typedBooking);

        // Fetch existing inspection if in view mode
        if (viewMode) {
          const inspectionsData = await getAllDocuments('inspections');
          const existingInspection = inspectionsData.find(
            (insp: any) => insp.booking?.id === bookingId && insp.inspectionFormType === inspectionType
          );

          if (existingInspection) {
            const typedInspection: Inspection = {
              id: existingInspection.id,
              inspectionFormType: existingInspection.inspectionFormType,
              inspectionDate: existingInspection.inspectionDate?.toDate ? existingInspection.inspectionDate.toDate() : new Date(),
              nextVehicleServiceDate: existingInspection.nextVehicleServiceDate?.toDate ? existingInspection.nextVehicleServiceDate.toDate() : new Date(),
              vehicleMilleage: existingInspection.vehicleMilleage || 0,
              parts: existingInspection.parts || {},
              images: existingInspection.images || {},
              createdAt: existingInspection.createdAt?.toDate ? existingInspection.createdAt.toDate() : new Date(),
              updatedAt: existingInspection.updatedAt?.toDate ? existingInspection.updatedAt.toDate() : new Date(),
              booking: typedBooking
            };
            setInspection(typedInspection);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, bookingId, inspectionType, viewMode]);

  // Helper function to convert Firebase Storage URL to base64 for PDF
  const convertUrlToBase64 = async (url: string): Promise<string> => {
    try {
      console.log('Converting URL to base64:', url);

      // Use API route to bypass CORS
      const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch image through proxy');
      }

      const data = await response.json();
      console.log('Converted to base64, length:', data.base64.length);
      return data.base64;
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      return '';
    }
  };

  // Convert Firebase Storage URLs to base64 for PDF generation
  useEffect(() => {
    const convertImagesToBase64 = async () => {
      if (!inspection?.images) {
        console.log('No inspection images to convert');
        setImagesLoading(false);
        return;
      }

      console.log('Starting image conversion for PDF...', inspection.images);
      setImagesLoading(true);

      const imageUrls = inspection.images;
      const base64Images: { [key: string]: string } = {};

      // Convert each image URL to base64
      for (const [key, url] of Object.entries(imageUrls)) {
        if (url && typeof url === 'string') {
          console.log(`Converting ${key}:`, url);
          const base64 = await convertUrlToBase64(url);
          if (base64) {
            base64Images[key] = base64;
            console.log(`Successfully converted ${key}`);
          }
        }
      }

      console.log('All images converted:', Object.keys(base64Images));
      setPdfImages(base64Images);
      setImagesLoading(false);
    };

    convertImagesToBase64();
  }, [inspection]);

  if (authLoading || !user) return null;

  // Check access permissions based on inspection type and form status
  const canAccessPreInspection = () => {
    if (!booking) return false;
    if (viewMode && inspection && inspection.inspectionFormType === 'pre') return true;
    if (!viewMode && booking.bookingStatus && !inspection) return true; // Approved and not submitted
    return false;
  };

  const canAccessPostInspection = () => {
    if (!booking) return false;
    if (viewMode && inspection && inspection.inspectionFormType === 'post') return true;
    if (!viewMode && booking.keyCollectionStatus && !inspection) return true; // Keys collected and not submitted
    return false;
  };

  const hasAccess = inspectionType === 'pre' ? canAccessPreInspection() : canAccessPostInspection();

  const handleSubmit = async (data: InspectionFormData) => {
    if (!booking) return;

    try {
      // First, create the inspection document to get an ID
      const inspectionData: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt' | 'images'> & { images: {} } = {
        inspectionFormType: inspectionType,
        inspectionDate: new Date(data.inspectionDate),
        nextVehicleServiceDate: new Date(data.nextServiceDate),
        vehicleMilleage: parseInt(data.currentMileage) || 0,
        parts: {
          remoteControl: { functionalStatus: data.inspectionItems[0].functional, remark: data.inspectionItems[0].remark },
          brakes: { functionalStatus: data.inspectionItems[1].functional, remark: data.inspectionItems[1].remark },
          steering: { functionalStatus: data.inspectionItems[2].functional, remark: data.inspectionItems[2].remark },
          operation: { functionalStatus: data.inspectionItems[3].functional, remark: data.inspectionItems[3].remark },
          engine: { functionalStatus: data.inspectionItems[4].functional, remark: data.inspectionItems[4].remark },
          panelInspection: { functionalStatus: data.inspectionItems[5].functional, remark: data.inspectionItems[5].remark },
          bumper: { functionalStatus: data.inspectionItems[6].functional, remark: data.inspectionItems[6].remark },
          doors: { functionalStatus: data.inspectionItems[7].functional, remark: data.inspectionItems[7].remark },
          roof: { functionalStatus: data.inspectionItems[8].functional, remark: data.inspectionItems[8].remark },
          exteriorLights: { functionalStatus: data.inspectionItems[9].functional, remark: data.inspectionItems[9].remark },
          safetyBelts: { functionalStatus: data.inspectionItems[10].functional, remark: data.inspectionItems[10].remark },
          airConditioning: { functionalStatus: data.inspectionItems[11].functional, remark: data.inspectionItems[11].remark },
          radio: { functionalStatus: data.inspectionItems[12].functional, remark: data.inspectionItems[12].remark },
          navigationSystem: { functionalStatus: data.inspectionItems[13].functional, remark: data.inspectionItems[13].remark },
          tires: { functionalStatus: data.inspectionItems[14].functional, remark: data.inspectionItems[14].remark },
        },
        images: {}, // Will be updated after uploading to Storage
        booking: booking
      };

      // Create the inspection document first
      const inspectionId = await createDocument('inspections', inspectionData);

      // Upload images to Firebase Storage and get download URLs
      const imageUrls: { [key: string]: string } = {};

      const imageMapping = [
        { key: 'vehicleLeft', file: data.vehicleImages.left, name: 'left' },
        { key: 'vehicleRight', file: data.vehicleImages.right, name: 'right' },
        { key: 'vehicleFront', file: data.vehicleImages.front, name: 'front' },
        { key: 'vehicleRear', file: data.vehicleImages.rear, name: 'rear' },
        { key: 'tyreFront', file: data.vehicleImages.frontTyre, name: 'front_tyre' },
        { key: 'tyreRear', file: data.vehicleImages.rearTyre, name: 'rear_tyre' },
      ];

      // Upload images to Storage
      const { uploadFile } = await import('@/firebase/storage');

      for (const { key, file, name } of imageMapping) {
        if (file && file instanceof File) {
          const path = `inspections/${inspectionId}/${name}.${file.name.split('.').pop()}`;
          const downloadURL = await uploadFile(file, path);
          imageUrls[key] = downloadURL;
        }
      }

      // Update the inspection document with image URLs
      if (Object.keys(imageUrls).length > 0) {
        const { updateDocument } = await import('@/firebase/firestore');
        await updateDocument('inspections', inspectionId, { images: imageUrls });
      }

      alert(`${inspectionType === 'pre' ? 'Pre' : 'Post'}-Trip Inspection form submitted successfully!`);
      router.push(`/staff/bookings/${bookingId}`);
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      alert('Error submitting inspection: ' + error.message);
    }
  };

  const handleCancel = () => {
    router.push(`/staff/bookings/${bookingId}`);
  };

  // Show loading state
  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading inspection form...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error if booking not found
  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">{error || "The booking you're trying to access doesn't exist."}</p>
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
          if (inspection) {
            return 'The pre-trip inspection form has already been submitted. You cannot edit it.';
          } else if (!booking.bookingStatus) {
            return 'You cannot submit the pre-trip inspection form yet. Please wait for admin to approve your booking request.';
          }
        }
      } else {
        if (viewMode) {
          return 'The post-trip inspection form has not been submitted yet. You can only view submitted forms.';
        } else {
          if (inspection) {
            return 'The post-trip inspection form has already been submitted. You cannot edit it.';
          } else if (!booking.keyCollectionStatus) {
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

  // Prepare PDF data from inspection (for view mode)
  const pdfData = inspection ? {
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
    vehicleImages: (() => {
      console.log('PDF Images for PDF generation:', pdfImages);
      return {
        left: pdfImages.vehicleLeft || null,
        right: pdfImages.vehicleRight || null,
        front: pdfImages.vehicleFront || null,
        rear: pdfImages.vehicleRear || null,
        top: null,
        frontTyre: pdfImages.tyreFront || null,
        rearTyre: pdfImages.tyreRear || null,
      };
    })(),
    adminName: booking.approvedBy ? `${booking.approvedBy.firstName} ${booking.approvedBy.lastName}` : 'N/A',
    adminApprovedDate: booking.updatedAt.toLocaleDateString('en-MY'),
    custodianName: booking.managedBy ? `${booking.managedBy.firstName} ${booking.managedBy.lastName}` : 'N/A',
    custodianReceivedDate: booking.keyCollectionStatus ? booking.updatedAt.toLocaleDateString('en-MY') : 'N/A',
    staffSubmittedDate: inspection.createdAt.toLocaleDateString('en-MY'),
  } : {
    inspectionDate: new Date().toLocaleDateString('en-MY'),
    vehicleRegNo: booking.vehicle?.plateNumber || '',
    vehicleModel: `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim(),
    project: booking.project,
    currentMileage: '',
    nextServiceDate: '',
    inspectionType: inspectionType,
    inspectionItems: {
      remoteControl: { functional: false, broken: false, remark: '' },
      brakes: { functional: false, broken: false, remark: '' },
      steering: { functional: false, broken: false, remark: '' },
      autoManualTransaxle: { functional: false, broken: false, remark: '' },
      engineAccelerates: { functional: false, broken: false, remark: '' },
      bodyPanelInspection: { functional: false, broken: false, remark: '' },
      bumperInspection: { functional: false, broken: false, remark: '' },
      doorsInspection: { functional: false, broken: false, remark: '' },
      roofInspection: { functional: false, broken: false, remark: '' },
      exteriorLights: { functional: false, broken: false, remark: '' },
      safetyBelts: { functional: false, broken: false, remark: '' },
      airConditioning: { functional: false, broken: false, remark: '' },
      radio: { functional: false, broken: false, remark: '' },
      navigationSystem: { functional: false, broken: false, remark: '' },
      tiresWheels: { functional: false, broken: false, remark: '' },
    },
    staffName: `${booking.bookedBy?.firstName || ''} ${booking.bookedBy?.lastName || ''}`.trim(),
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
    adminName: '',
    adminApprovedDate: '',
    custodianName: '',
    custodianReceivedDate: '',
    staffSubmittedDate: '',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link
                href={`/staff/bookings/${bookingId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <MdArrowBack className="w-5 h-5" />
                Back to Booking Details
              </Link>
              {viewMode && inspection && (
                imagesLoading ? (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
                    disabled
                  >
                    Converting images...
                  </button>
                ) : (
                  <PDFButton
                    data={pdfData}
                    fileName={`inspection-${inspectionType}-${bookingId}.pdf`}
                  />
                )
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Vehicle Inspection
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Booking ID: {bookingId}</p>
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
            plateNumber: booking.vehicle?.plateNumber || '',
            vehicle: `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim(),
            project: booking.project,
          }}
          initialData={inspection ? {
            inspectionType: inspection.inspectionFormType,
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
          } : undefined}
        />
      </main>
    </div>
  );
};

export default InspectionPage;
