export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode ?? 500;

  response.status(statusCode).json({
    error: {
      message: error.message ?? "Something went wrong.",
      code: error.code ?? "INTERNAL_SERVER_ERROR"
    }
  });
}

