import { Booking, Inspection } from '@/types';

/**
 * Check if a specific inspection type exists for a booking
 */
export const hasInspection = (
    inspections: Inspection[],
    bookingId: string,
    type: 'pre' | 'post'
): boolean => {
    return inspections.some(
        (inspection) =>
            inspection.booking.id === bookingId &&
            inspection.inspectionFormType === type
    );
};

/**
 * Get inspection to-do items for approved bookings
 * Rules:
 * 1. Booking must be approved (bookingStatus = true, no rejectionReason)
 * 2. Pre-trip inspection takes priority - must be done first
 * 3. Post-trip inspection can only be done AFTER key collection
 */
export const getInspectionTodos = (
    bookings: Booking[],
    inspections: Inspection[]
): Array<{
    booking: Booking;
    needsPreInspection: boolean;
    needsPostInspection: boolean;
}> => {
    return bookings
        .filter(booking => booking.bookingStatus && !booking.rejectionReason)
        .map(booking => {
            const hasPreInspection = hasInspection(inspections, booking.id, 'pre');
            const hasPostInspection = hasInspection(inspections, booking.id, 'post');

            // Determine what's needed
            let needsPreInspection = false;
            let needsPostInspection = false;

            if (!hasPreInspection) {
                // Pre-trip not submitted yet - this takes priority
                needsPreInspection = true;
            } else if (!hasPostInspection && booking.keyCollectionStatus) {
                // Pre-trip done, key collected, but post-trip not submitted yet
                // Can only submit post-trip AFTER key collection
                needsPostInspection = true;
            }

            return {
                booking,
                needsPreInspection,
                needsPostInspection,
            };
        })
        .filter(item => item.needsPreInspection || item.needsPostInspection);
};

/**
 * Get inspection status for display
 * Returns: 'Submitted', 'Pending', or 'Not Submitted'
 */
export const getInspectionStatus = (
    booking: Booking,
    inspections: Inspection[],
    type: 'pre' | 'post'
): 'Submitted' | 'Pending' | 'Not Submitted' => {
    // If booking not approved, cannot submit
    if (!booking.bookingStatus) {
        return 'Not Submitted';
    }

    // Check if inspection exists
    const exists = hasInspection(inspections, booking.id, type);

    if (exists) return 'Submitted';

    // For pre-trip: can submit once approved
    if (type === 'pre') return 'Pending';

    // For post-trip: can only submit after key collection
    if (type === 'post') {
        return booking.keyCollectionStatus ? 'Pending' : 'Not Submitted';
    }

    return 'Not Submitted';
};
