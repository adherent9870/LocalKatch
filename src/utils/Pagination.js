export const getPagination = (req) => {
  const page = Number(req.query.page) || 1;

  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};
