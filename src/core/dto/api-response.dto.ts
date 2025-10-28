interface ApiResponseInterface<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

class ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
  constructor(response: ApiResponseInterface<T>) {
    this.data = response.data;
    this.message = response.message;
    this.statusCode = response.statusCode;
    this.success = response.statusCode >= 200 && response.statusCode < 300;
  }
}

export { ApiResponse };
