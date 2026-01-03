import React, { ReactNode } from 'react';
import { Chip } from './';
import { Booking } from '@/types';
import { Inspection } from '@/types';

type TableVariant = 'receptionist' | 'staff';

interface BookingTableProps {
  bookings: Booking[];
  inspections?: Inspection[]; // Optional: to check if inspections exist
  emptyMessage?: string;
  showActions?: boolean;
  renderActions?: (booking: Booking) => ReactNode;
  variant?: TableVariant;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  inspections,
  emptyMessage = 'No bookings found',
  showActions = true,
  renderActions,
  variant = 'receptionist',
}) => {
  // Helper function to check if inspection exists
  const hasInspection = (bookingId: string, type: 'pre' | 'post'): boolean => {
    if (!inspections) return false;
    return inspections.some(
      (inspection) =>
        inspection.booking.id === bookingId &&
        inspection.inspectionFormType === type
    );
  };

  // Helper function to get inspection status
  const getInspectionStatus = (booking: Booking, type: 'pre' | 'post'): string => {
    // If booking not approved, inspection cannot be submitted
    if (!booking.bookingStatus) {
      return 'No';
    }

    // Check if inspection exists
    const exists = hasInspection(booking.id, type);
    return exists ? 'Submitted' : 'Not Submitted';
  };

  // Helper function to check if booking is overdue
  const isOverdue = (booking: Booking): boolean => {
    const now = new Date();
    const returnDate = new Date(booking.returnDate);
    return now > returnDate && !booking.keyReturnStatus;
  };

  // Helper function to format date
  const formatDate = (date: Date | string): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  };

  const getKeyCollectionChip = (status: boolean) => {
    if (status) return <Chip variant="success">Collected</Chip>;
    return <Chip variant="pending">Not Collected</Chip>;
  };

  const getKeyReturnChip = (status: boolean) => {
    if (status) return <Chip variant="success">Returned</Chip>;
    return <Chip variant="pending">Pending</Chip>;
  };

  const getInspectionChip = (status: string) => {
    if (status === 'Submitted') return <Chip variant="success">Submitted</Chip>;
    if (status === 'Not Submitted') return <Chip variant="error">Not Submitted</Chip>;
    if (status === 'No') return <Chip variant="default">No</Chip>;
    return <Chip variant="default">{status}</Chip>;
  };

  const getBookingStatusChip = (status: boolean, rejectionReason?: string) => {
    if (rejectionReason) return <Chip variant="error">Rejected</Chip>;
    if (status) return <Chip variant="success">Approved</Chip>;
    return <Chip variant="pending">Pending</Chip>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {variant === 'receptionist' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </th>
            {variant === 'receptionist' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {variant === 'staff' ? 'Booking Date' : 'Project'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {variant === 'staff' ? 'Return Date' : 'Booking Date'}
            </th>
            {variant === 'staff' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
            )}
            {variant === 'staff' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {variant === 'staff' ? 'Inspection Forms' : 'Key Collection'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {variant === 'staff' ? 'Key Status' : 'Key Return'}
            </th>
            {variant === 'receptionist' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inspection Forms
              </th>
            )}
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={variant === 'staff' ? (showActions ? 8 : 7) : (showActions ? 9 : 8)} className="px-6 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            bookings.map((booking) => {
              const isBookingOverdue = isOverdue(booking);
              const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();
              const preInspection = getInspectionStatus(booking, 'pre');
              const postInspection = getInspectionStatus(booking, 'post');

              return (
                <tr
                  key={booking.id}
                  className={isBookingOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''}
                >
                  {variant === 'receptionist' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {isBookingOverdue && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                            OVERDUE
                          </span>
                        )}
                        {booking.id}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vehicleName}</div>
                    <div className="text-xs text-gray-500">{booking.vehicle?.plateNumber || 'N/A'}</div>
                  </td>
                  {variant === 'receptionist' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.bookedBy ? `${booking.bookedBy.firstName || ''} ${booking.bookedBy.lastName || ''}`.trim() : 'N/A'}
                    </td>
                  )}
                  {variant === 'staff' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.returnDate)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.bookingDate)}</div>
                        <div className="text-xs text-gray-500">Return: {formatDate(booking.returnDate)}</div>
                      </td>
                    </>
                  )}
                  {variant === 'staff' && (
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.project}</td>
                  )}
                  {variant === 'staff' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getBookingStatusChip(booking.bookingStatus, booking.rejectionReason)}
                    </td>
                  )}
                  {variant === 'staff' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Pre:</span>
                            {getInspectionChip(preInspection)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Post:</span>
                            {getInspectionChip(postInspection)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Fetch:</span>
                            {getKeyCollectionChip(booking.keyCollectionStatus)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Return:</span>
                            {getKeyReturnChip(booking.keyReturnStatus)}
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getKeyCollectionChip(booking.keyCollectionStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getKeyReturnChip(booking.keyReturnStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Pre:</span>
                            {getInspectionChip(preInspection)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Post:</span>
                            {getInspectionChip(postInspection)}
                          </div>
                        </div>
                      </td>
                    </>
                  )}
                  {showActions && renderActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{renderActions(booking)}</td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
