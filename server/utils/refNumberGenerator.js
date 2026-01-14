import { getOne, getAll } from '../config/database.js';

/**
 * Generate a unique reference number in format HUDT-YYYY-XXX
 * @returns {string} Reference number
 */
export const generateRefNumber = () => {
  const year = new Date().getFullYear();

  // Get the highest number for this year
  const result = getOne(`
    SELECT ref_number FROM applications 
    WHERE ref_number LIKE ? 
    ORDER BY ref_number DESC 
    LIMIT 1
  `, [`HUDT-${year}-%`]);

  let nextNumber = 1;

  if (result && result.ref_number) {
    // Extract the number part and increment
    const parts = result.ref_number.split('-');
    const lastNumber = parseInt(parts[2], 10);
    nextNumber = lastNumber + 1;
  }

  // Pad with zeros to 3 digits
  const paddedNumber = nextNumber.toString().padStart(3, '0');

  return `HUDT-${year}-${paddedNumber}`;
};
