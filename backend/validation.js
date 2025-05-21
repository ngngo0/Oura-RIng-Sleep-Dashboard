// validation.js
function validateUser(user) {
  // Loop through each key in the schema
  for (const key in userSchema) {
    if (user.hasOwnProperty(key)) {
      // Check the type of the provided field
      const expectedType = userSchema[key];
      const value = user[key];

      if (expectedType === 'string' && typeof value !== 'string') {
        return { valid: false, error: `${key} must be a string` };
      }

      if (expectedType === 'number' && typeof value !== 'number') {
        return { valid: false, error: `${key} must be a number` };
      }
    }
  }
  return { valid: true };  // If no issues found, return valid
}

export { validateUser };