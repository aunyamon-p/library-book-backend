export const handleError = (res, err, options = {}) => {
  const {
    fallbackStatus = 500,
    defaultMessage = 'Server error'
  } = options;

  console.error(err);
  const detail = err?.message || 'Unknown error';
  const code = err?.number || err?.code;
  const status = err?.statusCode || fallbackStatus;

  res.status(status).json({
    error: defaultMessage,
    detail,
    code
  });
};
