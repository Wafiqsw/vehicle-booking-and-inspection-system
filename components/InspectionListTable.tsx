import React from 'react';
import Link from 'next/link';
import { Chip } from './';
import { Booking, Inspection } from '@/types';

interface InspectionListTableProps {
    bookings: Booking[];
    inspections: Inspection[];
    emptyMessage?: string;
}

const InspectionListTable: React.FC<InspectionListTableProps> = ({
    bookings,
    inspections,
    emptyMessage = 'No bookings found',
}) => {
    // Helper function to check if inspection exists
    const hasInspection = (bookingId: string, type: 'pre' | 'post'): boolean => {
        return inspections.some(
            (inspection) =>
                inspection.booking.id === bookingId &&
                inspection.inspectionFormType === type
        );
    };

    // Helper function to format date
    const formatDate = (date: Date | string): string => {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInspectionChip = (hasForm: boolean) => {
        if (hasForm) return <Chip variant="success">Submitted</Chip>;
        return <Chip variant="error">Not Submitted</Chip>;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pre-Trip Form
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Post-Trip Form
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        bookings.map((booking) => {
                            const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
                            const staffName = booking.bookedBy
                                ? `${booking.bookedBy.firstName || ''} ${booking.bookedBy.lastName || ''}`.trim()
                                : 'N/A';
                            const hasPreInspection = hasInspection(booking.id, 'pre');
                            const hasPostInspection = hasInspection(booking.id, 'post');

                            return (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {booking.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{vehicleName}</div>
                                        <div className="text-xs text-gray-500">{booking.vehicle?.plateNumber || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {staffName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {booking.project}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(booking.bookingDate)}</div>
                                        <div className="text-xs text-gray-500">Return: {formatDate(booking.returnDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getInspectionChip(hasPreInspection)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getInspectionChip(hasPostInspection)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex flex-col gap-2">
                                            {/* Pre-Trip Button */}
                                            {hasPreInspection ? (
                                                <Link
                                                    href={`/admin/bookings/${booking.id}/inspection?type=pre`}
                                                    className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs transition-colors"
                                                >
                                                    View Pre-Trip
                                                </Link>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium text-xs"
                                                    title="Pre-Trip inspection not submitted"
                                                >
                                                    View Pre-Trip
                                                </button>
                                            )}

                                            {/* Post-Trip Button */}
                                            {hasPostInspection ? (
                                                <Link
                                                    href={`/admin/bookings/${booking.id}/inspection?type=post`}
                                                    className="inline-flex items-center justify-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs transition-colors"
                                                >
                                                    View Post-Trip
                                                </Link>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium text-xs"
                                                    title="Post-Trip inspection not submitted"
                                                >
                                                    View Post-Trip
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InspectionListTable;
