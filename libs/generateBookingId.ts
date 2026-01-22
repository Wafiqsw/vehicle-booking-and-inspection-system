/**
 * Generates a standardized booking ID in format: BK- + 9 alphanumeric characters
 * Example: BK-1A2B3C4D5, BK-X7Y8Z9A1B
 */
export const generateBookingId = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK-';

  for (let i = 0; i < 9; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};

/**
 * Validates if a string is a valid booking ID format
 * @param id - The string to validate
 * @returns true if valid booking ID format (BK- + 9 alphanumeric)
 */
export const isValidBookingId = (id: string): boolean => {
  const bookingIdRegex = /^BK-[A-Z0-9]{9}$/;
  return bookingIdRegex.test(id);
};
