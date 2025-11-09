/**
 * Searches for a query string within a string field
 * @param query The search query
 * @param fieldValue The field value to search in
 * @returns true if the query is found in the field value
 */
export function searchStringField(query: string, fieldValue: string): boolean {
  const lowerQuery = query.toLowerCase();
  const lowerField = fieldValue.toLowerCase();
  return lowerField.includes(lowerQuery);
}

/**
 * Searches for a query string within an array field
 * @param query The search query
 * @param fieldValue The array field to search in
 * @returns true if the query is found in any element of the array
 */
export function searchArrayField(query: string, fieldValue: string[]): boolean {
  const lowerQuery = query.toLowerCase();
  for (let i = 0; i < fieldValue.length; i++) {
    const lowerElement = fieldValue[i].toLowerCase();
    if (lowerElement.includes(lowerQuery)) {
      return true;
    }
  }
  return false;
}
