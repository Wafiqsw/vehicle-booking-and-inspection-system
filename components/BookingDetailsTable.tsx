import React from 'react';
import { Chip } from './';

export interface BookingDetails {
  id?: string;
  staffName?: string;
  vehicle: string;
  plateNumber: string;
  bookingDate: string;
  returnDate: string;
  project: string;
  purpose?: string;
  destination?: string;
  passengers?: number;
  status?: string;
  requestedDate?: string;
  approvedBy?: string | null;
  approvalDate?: string | null;
  rejectionReason?: string;
  preInspectionForm?: string;
  postInspectionForm?: string;
  keyCollectionStatus?: string;
  keyReturnStatus?: string;
  notes?: string;
}

interface BookingDetailsTableProps {
  booking: BookingDetails;
  variant?: 'staff' | 'admin' | 'receptionist';
}

export const BookingDetailsTable: React.FC<BookingDetailsTableProps> = ({
  booking,
  variant = 'staff'
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusChip = (status: string) => {
    const chipVariant = status === 'Approved'
      ? 'success'
      : status === 'Pending'
        ? 'pending'
        : 'error';
    return <Chip variant={chipVariant}>{status}</Chip>;
  };

  const getInspectionChip = (status: string) => {
    const chipVariant = status === 'Submitted'
      ? 'success'
      : status === 'Pending'
        ? 'pending'
        : 'default';
    const label = status === 'Submitted'
      ? 'Submitted'
      : status === 'Pending'
        ? 'Pending'
        : 'Not Submitted';
    return <Chip variant={chipVariant}>{label}</Chip>;
  };

  const getKeyCollectionChip = (status: string) => {
    const chipVariant = status === 'Collected'
      ? 'success'
      : status === 'Ready to Collect'
        ? 'info'
        : 'default';
    const label = status === 'Collected'
      ? 'Collected'
      : status === 'Ready to Collect'
        ? 'Ready to Collect'
        : 'Not Collected';
    return <Chip variant={chipVariant}>{label}</Chip>;
  };

  const getKeyReturnChip = (status: string) => {
    const chipVariant = status === 'Returned'
      ? 'success'
      : status === 'Pending'
        ? 'pending'
        : 'default';
    const label = status === 'Returned'
      ? 'Returned'
      : status === 'Pending'
        ? 'Pending'
        : 'Not Returned';
    return <Chip variant={chipVariant}>{label}</Chip>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Information</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            {/* Admin-specific: Staff Name */}
            {variant === 'admin' && booking.staffName && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50 w-1/3">
                  Staff Name
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900 font-medium">
                  {booking.staffName}
                </td>
              </tr>
            )}

            {/* Vehicle */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50 w-1/3">
                Vehicle
              </td>
              <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900 font-medium">
                {booking.vehicle}
              </td>
            </tr>

            {/* Plate Number */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                Plate Number
              </td>
              <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                {booking.plateNumber}
              </td>
            </tr>

            {/* Booking Date */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                Booking Date
              </td>
              <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                {formatDate(booking.bookingDate)}
              </td>
            </tr>

            {/* Return Date */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                Return Date
              </td>
              <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                {formatDate(booking.returnDate)}
              </td>
            </tr>

            {/* Project */}
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                Project
              </td>
              <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                {booking.project}
              </td>
            </tr>

            {/* Destination */}
            {booking.destination && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Destination
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {booking.destination}
                </td>
              </tr>
            )}

            {/* Passengers */}
            {booking.passengers !== undefined && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Passengers
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {booking.passengers}
                </td>
              </tr>
            )}

            {/* Admin-specific: Requested Date */}
            {variant === 'admin' && booking.requestedDate && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Requested Date
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {formatDate(booking.requestedDate)}
                </td>
              </tr>
            )}

            {/* Booking Status */}
            {booking.status && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Booking Status
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {getStatusChip(booking.status)}
                </td>
              </tr>
            )}

            {/* Admin-specific: Approved By */}
            {variant === 'admin' && booking.approvedBy && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Approved By
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {booking.approvedBy}
                </td>
              </tr>
            )}

            {/* Admin-specific: Approval Date */}
            {variant === 'admin' && booking.approvalDate && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Approval Date
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {formatDate(booking.approvalDate)}
                </td>
              </tr>
            )}

            {/* Rejection Reason (if rejected) */}
            {booking.rejectionReason && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Rejection Reason
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-red-600">
                  {booking.rejectionReason}
                </td>
              </tr>
            )}

            {/* Pre-Inspection Form */}
            {booking.preInspectionForm && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Pre-Inspection Form
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {getInspectionChip(booking.preInspectionForm)}
                </td>
              </tr>
            )}

            {/* Post-Inspection Form */}
            {booking.postInspectionForm && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Post-Inspection Form
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {getInspectionChip(booking.postInspectionForm)}
                </td>
              </tr>
            )}

            {/* Key Collection */}
            {booking.keyCollectionStatus && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Key Collection
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {getKeyCollectionChip(booking.keyCollectionStatus)}
                </td>
              </tr>
            )}

            {/* Key Return */}
            {booking.keyReturnStatus && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Key Return
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {getKeyReturnChip(booking.keyReturnStatus)}
                </td>
              </tr>
            )}

            {/* Notes */}
            {booking.notes && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50">
                  Notes
                </td>
                <td className="border border-gray-300 py-3 px-4 text-sm text-gray-900">
                  {booking.notes}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingDetailsTable;
