export const handleNext = (data, setSearchParams) => {
  if (data?.pageInfo?.hasNextPage) {
    const nextCursor = data?.pageInfo?.endCursor;
    setSearchParams({ after: nextCursor });
  }
};

// Handle Previous button
export const handlePrevious = (data, setSearchParams) => {
  if (data?.pageInfo?.hasPreviousPage) {
    const prevCursor = data?.pageInfo?.startCursor;
    setSearchParams({ before: prevCursor });
  }
};
