// UUID utility functions

export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const ensureUUID = (id: string | number): string => {
  if (typeof id === 'number') {
    // Convert number to UUID-like string (for compatibility)
    return `00000000-0000-4000-8000-${id.toString().padStart(12, '0')}`;
  }
  
  if (typeof id === 'string' && isValidUUID(id)) {
    return id;
  }
  
  // If it's a string but not a valid UUID, try to convert it
  if (typeof id === 'string') {
    // If it's a numeric string, convert it
    const numId = parseInt(id);
    if (!isNaN(numId)) {
      return `00000000-0000-4000-8000-${numId.toString().padStart(12, '0')}`;
    }
  }
  
  // Fallback: generate a new UUID
  return generateUUID();
};