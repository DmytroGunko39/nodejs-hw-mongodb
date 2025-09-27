export const calculatePaginationData = (count, perPage, page) => {
  const totalPages = perPage > 0 ? Math.ceil(count / perPage) : 0;
  const hasNextPage = totalPages > page;
  const hasPreviousPage = page > 1;

  return {
    page,
    perPage,
    totalItem: count,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};
