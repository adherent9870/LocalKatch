const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];

    const result = schema.safeParse(data);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[source] = result.data;

    next();
  };
};

export default validate;
