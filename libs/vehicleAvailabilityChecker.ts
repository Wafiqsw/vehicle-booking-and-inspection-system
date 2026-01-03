import { Vehicle } from '@/types';
import { Booking } from '@/types';

/**
 * Check if a vehicle is available on a specific date
 * 
 * @param vehicle - The vehicle to check
 * @param date - The date to check (Date object or ISO string)
 * @param bookings - Array of all bookings
 * @returns true if vehicle is available, false if booked or in maintenance
 */
export const isVehicleAvailable = (
    vehicle: Vehicle,
    date: Date | string,
    bookings: Booking[]
): boolean => {
    // If vehicle is in manual maintenance mode, it's not available
    if (vehicle.maintenanceStatus) {
        return false;
    }

    // Convert date to Date object if it's a string
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    checkDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find if there's any approved booking that overlaps with the check date
    const hasConflictingBooking = bookings.some((booking) => {
        // Only check approved bookings (bookingStatus === true)
        if (!booking.bookingStatus) {
            return false;
        }

        // Check if booking is for this vehicle
        const isForThisVehicle = booking.vehicle.id === vehicle.id;

        if (!isForThisVehicle) {
            return false;
        }

        // Parse booking dates
        const bookingStart = new Date(booking.bookingDate);
        const bookingEnd = new Date(booking.returnDate);
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);

        // Check if the check date falls within the booking period (inclusive)
        return checkDate >= bookingStart && checkDate <= bookingEnd;
    });

    // Vehicle is available if there's no conflicting booking
    return !hasConflictingBooking;
};

/**
 * Check if a vehicle is available for a date range
 * 
 * @param vehicle - The vehicle to check
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param bookings - Array of all bookings
 * @returns true if vehicle is available for the entire range, false otherwise
 */
export const isVehicleAvailableForRange = (
    vehicle: Vehicle,
    startDate: Date | string,
    endDate: Date | string,
    bookings: Booking[]
): boolean => {
    // If vehicle is in manual maintenance mode, it's not available
    if (vehicle.maintenanceStatus) {
        return false;
    }

    // Convert dates to Date objects if they're strings
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Find if there's any booking that conflicts with the date range
    const hasConflictingBooking = bookings.some((booking) => {
        // Skip bookings that are:
        // 1. Not approved (bookingStatus: false) AND not yet reviewed (approvedBy: null)
        // This means the booking is truly pending and should block the vehicle
        // 2. Rejected bookings (have rejectionReason) - these should NOT block

        // If booking is rejected, skip it (vehicle should be available)
        if (booking.rejectionReason) {
            return false;
        }

        // If booking is approved, it should block the vehicle
        if (booking.bookingStatus) {
            // Continue to check overlap
        }
        // If booking is pending (not approved) but has been reviewed by admin
        else if (booking.approvedBy) {
            return false;
        }
        // If booking is pending and NOT yet reviewed - this should block the vehicle
        else {
            // Continue to check overlap
        }

        // Check if booking is for this vehicle
        const isForThisVehicle = booking.vehicle.id === vehicle.id;

        if (!isForThisVehicle) {
            return false;
        }

        // Parse booking dates
        const bookingStart = new Date(booking.bookingDate);
        const bookingEnd = new Date(booking.returnDate);
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);

        // Check if there's any overlap between the ranges
        // Ranges overlap if: start1 <= end2 AND start2 <= end1
        const overlaps = start <= bookingEnd && bookingStart <= end;

        return overlaps;
    });

    // Vehicle is available if there's no conflicting booking
    return !hasConflictingBooking;
};

/**
 * Get the next available date for a vehicle
 * 
 * @param vehicle - The vehicle to check
 * @param startDate - Date to start checking from (defaults to today)
 * @param bookings - Array of all bookings
 * @param maxDaysToCheck - Maximum number of days to check ahead (default 90)
 * @returns Next available date or null if none found within maxDaysToCheck
 */
export const getNextAvailableDate = (
    vehicle: Vehicle,
    bookings: Booking[],
    startDate: Date | string = new Date(),
    maxDaysToCheck: number = 90
): Date | null => {
    // If vehicle is in permanent maintenance, return null
    if (vehicle.maintenanceStatus) {
        return null;
    }

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    start.setHours(0, 0, 0, 0);

    // Check each day
    for (let i = 0; i < maxDaysToCheck; i++) {
        const checkDate = new Date(start);
        checkDate.setDate(start.getDate() + i);

        if (isVehicleAvailable(vehicle, checkDate, bookings)) {
            return checkDate;
        }
    }

    return null;
};

/**
 * Get all booked dates for a vehicle within a date range
 * 
 * @param vehicle - The vehicle to check
 * @param startDate - Start of the range
 * @param endDate - End of the range
 * @param bookings - Array of all bookings
 * @returns Array of dates when the vehicle is booked
 */
export const getBookedDates = (
    vehicle: Vehicle,
    startDate: Date | string,
    endDate: Date | string,
    bookings: Booking[]
): Date[] => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const bookedDates: Date[] = [];

    // Get all approved bookings for this vehicle
    const vehicleBookings = bookings.filter(
        (booking) =>
            booking.bookingStatus && booking.vehicle.id === vehicle.id
    );

    // For each booking, add all dates in the range
    vehicleBookings.forEach((booking) => {
        const bookingStart = new Date(booking.bookingDate);
        const bookingEnd = new Date(booking.returnDate);
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);

        // Only include dates that fall within our search range
        const rangeStart = bookingStart < start ? start : bookingStart;
        const rangeEnd = bookingEnd > end ? end : bookingEnd;

        // Add each date in the booking range
        const currentDate = new Date(rangeStart);
        while (currentDate <= rangeEnd) {
            bookedDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    return bookedDates;
};
