class ApiResponse {
  constructor(success, message, data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
  
  static success(message, data = null) {
    return new ApiResponse(true, message, data, 200);
  }
  
  static created(message, data = null) {
    return new ApiResponse(true, message, data, 201);
  }
  
  static error(message, statusCode = 400) {
    return new ApiResponse(false, message, null, statusCode);
  }
  
  static unauthorized(message = 'Unauthorized access') {
    return new ApiResponse(false, message, null, 401);
  }
  
  static forbidden(message = 'Forbidden') {
    return new ApiResponse(false, message, null, 403);
  }
  
  static notFound(message = 'Resource not found') {
    return new ApiResponse(false, message, null, 404);
  }
  
  static serverError(message = 'Internal server error') {
    return new ApiResponse(false, message, null, 500);
  }
}

module.exports = ApiResponse;