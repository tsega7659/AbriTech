/**
 * Utility functions for sanitizing user inputs.
 */

export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim();
};

export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
};

export const sanitizeUsername = (username) => {
    if (typeof username !== 'string') return '';
    return username.trim().toLowerCase();
};

export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return '';
    // Remove all non-numeric characters except if someone starts with '+'
    return phone.trim().replace(/[^\d+]/g, '');
};

export const sanitizeFormData = (data) => {
    const sanitized = { ...data };

    if (sanitized.fullName) sanitized.fullName = sanitizeString(sanitized.fullName);
    if (sanitized.username) sanitized.username = sanitizeUsername(sanitized.username);
    if (sanitized.email) sanitized.email = sanitizeEmail(sanitized.email);
    if (sanitized.phoneNumber) sanitized.phoneNumber = sanitizePhone(sanitized.phoneNumber);
    if (sanitized.phoneNumber === "") delete sanitized.phoneNumber; // If empty after sanitize, let it be handled by validation or backend defaults

    // For RegisterStudent specifically
    if (sanitized.parentEmail) sanitized.parentEmail = sanitizeEmail(sanitized.parentEmail);
    if (sanitized.parentPhone) sanitized.parentPhone = sanitizePhone(sanitized.parentPhone);
    if (sanitized.schoolName) sanitized.schoolName = sanitizeString(sanitized.schoolName);
    if (sanitized.address) sanitized.address = sanitizeString(sanitized.address);
    if (sanitized.classLevel) sanitized.classLevel = sanitizeString(sanitized.classLevel);

    return sanitized;
};
