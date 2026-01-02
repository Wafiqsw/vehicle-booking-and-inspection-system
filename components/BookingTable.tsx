import React, { ReactNode } from 'react';
import { Chip } from './';

// Define the booking type
export interface Booking {
  id: string;
  vehicle: string;
  plateNumber: string;
  staffName?: string;
  project: string;
  bookingDate: string;
  returnDate: string;
  destination?: string;
  status?: string;
  rejectionReason?: string;
  keyCollectionStatus: string;
  keyReturnStatus: string;
  preInspectionStatus: string;
  postInspectionStatus: string;
  isOverdue?: boolean;
  shouldHide?: boolean;
  daysPastReturn?: number;
}

type TableVariant = 'receptionist' | 'staff';

interface BookingTableProps {
  bookings: Booking[];
  emptyMessage?: string;
  showActions?: boolean;
  renderActions?: (booking: Booking) => ReactNode;
  variant?: TableVariant;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  emptyMessage = 'No bookings found',
  showActions = true,
  renderActions,
  variant = 'receptionist',
}) => {
  const getKeyCollectionChip = (status: string) => {
    if (status === 'Collected') return <Chip variant="success">Collected</Chip>;
    if (status === 'Not Collected') return <Chip variant="pending">Not Collected</Chip>;
    return <Chip variant="default">{status}</Chip>;
  };

  const getKeyReturnChip = (status: string) => {
    if (status === 'Returned') return <Chip variant="success">Returned</Chip>;
    if (status === 'Pending') return <Chip variant="pending">Pending</Chip>;
    return <Chip variant="default">{status}</Chip>;
  };

  const getInspectionChip = (status: string) => {
    if (status === 'Submitted') return <Chip variant="success">Submitted</Chip>;
    if (status === 'Not Submitted') return <Chip variant="error">Not Submitted</Chip>;
    return <Chip variant="default">{status}</Chip>;
  };

  const getBookingStatusChip = (status: string) => {
    if (status === 'Approved') return <Chip variant="success">Approved</Chip>;
    if (status === 'Pending') return <Chip variant="pending">Pending</Chip>;
    if (status === 'Rejected') return <Chip variant="error">Rejected</Chip>;
    return <Chip variant="default">{status}</Chip>;
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
            bookings.map((booking) => (
              <tr
                key={booking.id}
                className={booking.isOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''}
              >
                {variant === 'receptionist' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {booking.isOverdue && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                          OVERDUE
                        </span>
                      )}
                      {booking.id}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.vehicle}</div>
                  <div className="text-xs text-gray-500">{booking.plateNumber}</div>
                </td>
                {variant === 'receptionist' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.staffName}
                  </td>
                )}
                {variant === 'staff' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.bookingDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.returnDate}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.project}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.bookingDate}</div>
                      <div className="text-xs text-gray-500">Return: {booking.returnDate}</div>
                    </td>
                  </>
                )}
                {variant === 'staff' && (
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.project}</td>
                )}
                {variant === 'staff' && booking.status && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getBookingStatusChip(booking.status)}
                  </td>
                )}
                {variant === 'staff' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Pre:</span>
                          {getInspectionChip(booking.preInspectionStatus)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Post:</span>
                          {getInspectionChip(booking.postInspectionStatus)}
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
                          {getInspectionChip(booking.preInspectionStatus)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Post:</span>
                          {getInspectionChip(booking.postInspectionStatus)}
                        </div>
                      </div>
                    </td>
                  </>
                )}
                {showActions && renderActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderActions(booking)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
