'use client';

import { useState, useEffect } from 'react';
import { Sidebar, InspectionListTable } from '@/components';
import { adminNavLinks } from '@/constant';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments } from '@/firebase/firestore';
import { Booking, Inspection } from '@/types';

const AdminInspectionPage = () => {
    const { user, loading } = useAuth({
        redirectTo: '/admin/auth',
        requiredRole: 'Admin'
    });

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [dataLoading, setDataLoading] = useState(true);

    // Fetch all bookings and inspections from Firestore
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setDataLoading(true);

                const [bookingsData, inspectionsData] = await Promise.all([
                    getAllDocuments('bookings'),
                    getAllDocuments('inspections')
                ]);

                // Filter to show only approved bookings
                const approvedBookings = bookingsData
                    .filter((b: any) => b.bookingStatus === true)
                    .map((doc: any): Booking => ({
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
                    }));

                setBookings(approvedBookings);

                // Map inspections
                const allInspections = inspectionsData.map((doc: any): Inspection => ({
                    id: doc.id,
                    inspectionFormType: doc.inspectionFormType || 'pre',
                    inspectionDate: doc.inspectionDate?.toDate ? doc.inspectionDate.toDate() : new Date(doc.inspectionDate),
                    nextVehicleServiceDate: doc.nextVehicleServiceDate?.toDate ? doc.nextVehicleServiceDate.toDate() : new Date(doc.nextVehicleServiceDate),
                    vehicleMilleage: doc.vehicleMilleage || 0,
                    parts: doc.parts || {},
                    images: doc.images || {},
                    createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
                    updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
                    booking: doc.booking || { id: '' }
                }));

                setInspections(allInspections);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                alert('Error loading data: ' + error.message);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading || !user) return null;

    // Helper function to check if inspection exists
    const hasInspection = (bookingId: string, type: 'pre' | 'post'): boolean => {
        return inspections.some(
            (inspection) =>
                inspection.booking.id === bookingId &&
                inspection.inspectionFormType === type
        );
    };

    // Apply search and filter
    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.vehicle?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.bookedBy?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.bookedBy?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.project.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const hasPreInspection = hasInspection(booking.id, 'pre');
        const hasPostInspection = hasInspection(booking.id, 'post');

        if (filterStatus === 'All') return true;
        if (filterStatus === 'Pre-Trip Submitted') return hasPreInspection;
        if (filterStatus === 'Post-Trip Submitted') return hasPostInspection;
        if (filterStatus === 'Both Submitted') return hasPreInspection && hasPostInspection;
        if (filterStatus === 'None Submitted') return !hasPreInspection && !hasPostInspection;

        return true;
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Inspections</h1>
                    <p className="text-gray-600 mt-2">View and manage vehicle inspection forms</p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by Booking ID, Vehicle, Staff, or Project..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            >
                                <option value="All">All Bookings</option>
                                <option value="Pre-Trip Submitted">Pre-Trip Submitted</option>
                                <option value="Post-Trip Submitted">Post-Trip Submitted</option>
                                <option value="Both Submitted">Both Submitted</option>
                                <option value="None Submitted">None Submitted</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inspections List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Inspection Forms</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Total Bookings: {filteredBookings.length}
                        </p>
                    </div>

                    {dataLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading inspection data...</p>
                        </div>
                    ) : (
                        <InspectionListTable
                            bookings={filteredBookings}
                            inspections={inspections}
                            emptyMessage="No bookings found matching your criteria"
                        />
                    )}
                </div>

                {/* Info Note */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-blue-600 text-sm font-bold">i</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Admin Guide</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Click "View Pre-Trip" or "View Post-Trip" to review submitted inspection forms</li>
                                <li>• Disabled buttons indicate forms that haven't been submitted yet</li>
                                <li>• Use search and filters to find specific inspections quickly</li>
                                <li>• All inspection forms are read-only for admin review</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminInspectionPage;
