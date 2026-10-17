export function getPagination(total: number, pageSize: number, currentPage = 1) {
  if (!Number.isInteger(pageSize) || pageSize < 1)
    throw new Error('pageSize must be a positive integer');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages)
    throw new Error('Page is outside the collection');
  return { totalPages, start: (currentPage - 1) * pageSize, end: currentPage * pageSize };
}
