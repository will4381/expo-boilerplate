/*
 * API SERVICE REFERENCE GUIDE
 * 
 * Features:
 * - Secure HTTPS-only requests
 * - Bearer token authentication
 * - API key authentication
 * - JSON encoding/decoding
 * - Comprehensive error handling
 * - Request/response logging (debug only)
 * - Timeout configuration
 * - Custom headers support
 * 
 * Usage Examples:
 * // GET request
 * const users: User[] = await APIService.shared.get<User[]>('/users');
 * 
 * // POST request with body
 * const newUser = await APIService.shared.post<User, UserData>('/users', userData);
 * 
 * // With custom headers
 * const data = await APIService.shared.get<any>('/protected', { 'X-Custom': 'value' });
 * 
 * // With authentication
 * APIService.shared.setBearerToken('your-token-here');
 * const profile = await APIService.shared.get<UserProfile>('/profile');
 * 
 * Configuration:
 * - Set base URL: APIService.shared.configure('https://api.example.com')
 * - Set timeout: APIService.shared.setTimeout(30000)
 * - Enable logging: APIService.shared.enableLogging(true)
 */

// MARK: - API Error Types
export enum APIErrorType {
  INVALID_URL = 'INVALID_URL',
  NO_DATA = 'NO_DATA',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DECODING_ERROR = 'DECODING_ERROR',
  ENCODING_ERROR = 'ENCODING_ERROR',
}

export class APIError extends Error {
  public type: APIErrorType;
  public statusCode?: number;
  public originalError?: Error;

  constructor(type: APIErrorType, message: string, statusCode?: number, originalError?: Error) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }

  static invalidURL(): APIError {
    return new APIError(APIErrorType.INVALID_URL, 'Invalid URL');
  }

  static noData(): APIError {
    return new APIError(APIErrorType.NO_DATA, 'No data received');
  }

  static invalidResponse(): APIError {
    return new APIError(APIErrorType.INVALID_RESPONSE, 'Invalid response');
  }

  static unauthorized(): APIError {
    return new APIError(APIErrorType.UNAUTHORIZED, 'Unauthorized - check your credentials', 401);
  }

  static forbidden(): APIError {
    return new APIError(APIErrorType.FORBIDDEN, 'Forbidden - insufficient permissions', 403);
  }

  static notFound(): APIError {
    return new APIError(APIErrorType.NOT_FOUND, 'Resource not found', 404);
  }

  static serverError(statusCode: number): APIError {
    return new APIError(APIErrorType.SERVER_ERROR, `Server error (Code: ${statusCode})`, statusCode);
  }

  static networkError(error: Error): APIError {
    return new APIError(APIErrorType.NETWORK_ERROR, `Network error: ${error.message}`, undefined, error);
  }

  static decodingError(error: Error): APIError {
    return new APIError(APIErrorType.DECODING_ERROR, `Data decoding error: ${error.message}`, undefined, error);
  }

  static encodingError(error: Error): APIError {
    return new APIError(APIErrorType.ENCODING_ERROR, `Data encoding error: ${error.message}`, undefined, error);
  }
}

// MARK: - HTTP Method
export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// MARK: - Empty Response Helper
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EmptyResponse {}

// MARK: - API Service
export class APIService {
  public static readonly shared = new APIService();

  // MARK: - Configuration Properties
  private baseURL: string = '';
  private timeout: number = 30000; // 30 seconds in milliseconds
  private bearerToken?: string;
  private apiKey?: string;
  private commonHeaders: Record<string, string> = {};
  private isLoggingEnabled: boolean = false;

  private constructor() {}

  // MARK: - Configuration Methods

  /**
   * Configure the base URL for all API calls
   * @param baseURL The base URL (e.g., "https://api.example.com")
   */
  configure(baseURL: string): void {
    this.baseURL = baseURL.trim();
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }
  }

  /**
   * Set request timeout in milliseconds
   * @param timeout Timeout in milliseconds (default: 30000)
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Set Bearer token for authentication
   * @param token The bearer token
   */
  setBearerToken(token?: string): void {
    this.bearerToken = token;
  }

  /**
   * Set API key for authentication
   * @param apiKey The API key
   */
  setAPIKey(apiKey?: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Set common headers that will be added to all requests
   * @param headers Dictionary of headers
   */
  setCommonHeaders(headers: Record<string, string>): void {
    this.commonHeaders = headers;
  }

  /**
   * Enable or disable request/response logging (for debugging)
   * @param enabled Whether logging is enabled
   */
  enableLogging(enabled: boolean): void {
    this.isLoggingEnabled = enabled;
  }

  // MARK: - HTTP Methods

  /**
   * Perform GET request
   * @param endpoint API endpoint (e.g., "/users")
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithoutBody<T>(HTTPMethod.GET, endpoint, headers);
  }

  // MARK: - POST Methods

  /**
   * Perform POST request with body
   * @param endpoint API endpoint
   * @param body Request body object
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async post<T, U = any>(endpoint: string, body: U, headers?: Record<string, string>): Promise<T> {
    return this.requestWithBody<T, U>(HTTPMethod.POST, endpoint, body, headers);
  }

  /**
   * Perform POST request without body
   * @param endpoint API endpoint
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async postEmpty<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithoutBody<T>(HTTPMethod.POST, endpoint, headers);
  }

  // MARK: - PUT Methods

  /**
   * Perform PUT request with body
   * @param endpoint API endpoint
   * @param body Request body object
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async put<T, U = any>(endpoint: string, body: U, headers?: Record<string, string>): Promise<T> {
    return this.requestWithBody<T, U>(HTTPMethod.PUT, endpoint, body, headers);
  }

  /**
   * Perform PUT request without body
   * @param endpoint API endpoint
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async putEmpty<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithoutBody<T>(HTTPMethod.PUT, endpoint, headers);
  }

  /**
   * Perform DELETE request
   * @param endpoint API endpoint
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithoutBody<T>(HTTPMethod.DELETE, endpoint, headers);
  }

  // MARK: - PATCH Methods

  /**
   * Perform PATCH request with body
   * @param endpoint API endpoint
   * @param body Request body object
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async patch<T, U = any>(endpoint: string, body: U, headers?: Record<string, string>): Promise<T> {
    return this.requestWithBody<T, U>(HTTPMethod.PATCH, endpoint, body, headers);
  }

  /**
   * Perform PATCH request without body
   * @param endpoint API endpoint
   * @param headers Optional additional headers
   * @returns Decoded response object
   */
  async patchEmpty<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithoutBody<T>(HTTPMethod.PATCH, endpoint, headers);
  }

  // MARK: - Core Request Methods

  /**
   * Core request method for requests with body
   */
  private async requestWithBody<T, U>(
    method: HTTPMethod,
    endpoint: string,
    body: U,
    headers?: Record<string, string>
  ): Promise<T> {
    // Validate base URL is configured
    if (!this.baseURL) {
      throw APIError.invalidURL();
    }

    // Create full URL
    const fullURL = this.baseURL + endpoint;
    try {
      const url = new URL(fullURL);
      
      // Ensure HTTPS for security
      if (url.protocol !== 'https:') {
        throw APIError.invalidURL();
      }
    } catch {
      throw APIError.invalidURL();
    }

    // Create request options
    const requestOptions: RequestInit = {
      method,
      headers: this.buildHeaders(headers),
      signal: AbortSignal.timeout(this.timeout),
    };

    // Add body
    try {
      requestOptions.body = JSON.stringify(body);
      (requestOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
    } catch (error) {
      throw APIError.encodingError(error as Error);
    }

    return this.performRequest<T>(fullURL, requestOptions);
  }

  /**
   * Core request method for requests without body
   */
  private async requestWithoutBody<T>(
    method: HTTPMethod,
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    // Validate base URL is configured
    if (!this.baseURL) {
      throw APIError.invalidURL();
    }

    // Create full URL
    const fullURL = this.baseURL + endpoint;
    try {
      const url = new URL(fullURL);
      
      // Ensure HTTPS for security
      if (url.protocol !== 'https:') {
        throw APIError.invalidURL();
      }
    } catch {
      throw APIError.invalidURL();
    }

    // Create request options
    const requestOptions: RequestInit = {
      method,
      headers: this.buildHeaders(headers),
      signal: AbortSignal.timeout(this.timeout),
    };

    return this.performRequest<T>(fullURL, requestOptions);
  }

  /**
   * Performs the actual network request and handles response
   */
  private async performRequest<T>(url: string, options: RequestInit): Promise<T> {
    // Log request if enabled
    if (this.isLoggingEnabled) {
      this.logRequest(url, options);
    }

    try {
      const response = await fetch(url, options);

      // Log response if enabled
      if (this.isLoggingEnabled) {
        await this.logResponse(response.clone());
      }

      // Handle HTTP status codes
      this.handleHTTPStatusCode(response.status);

      // Handle empty responses for certain status codes
      if (response.status === 204 || !response.body) {
        return {} as T;
      }

      // Get response text
      const responseText = await response.text();

      // If empty response, return empty object
      if (!responseText.trim()) {
        return {} as T;
      }

      // Decode response
      try {
        return JSON.parse(responseText) as T;
      } catch (error) {
        throw APIError.decodingError(error as Error);
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.networkError(error as Error);
      }
    }
  }

  // MARK: - Helper Methods

  private buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'React Native',
      ...this.commonHeaders,
    };

    // Add authentication headers
    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    // Add additional headers
    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }

    return headers;
  }

  private handleHTTPStatusCode(statusCode: number): void {
    switch (statusCode) {
      case 200:
      case 201:
      case 202:
      case 203:
      case 204:
      case 205:
      case 206:
      case 207:
      case 208:
      case 226:
        break; // Success
      case 401:
        throw APIError.unauthorized();
      case 403:
        throw APIError.forbidden();
      case 404:
        throw APIError.notFound();
      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
      case 505:
      case 506:
      case 507:
      case 508:
      case 510:
      case 511:
        throw APIError.serverError(statusCode);
      default:
        throw APIError.serverError(statusCode);
    }
  }

  private logRequest(url: string, options: RequestInit): void {
    console.log('🌐 API Request:');
    console.log(`URL: ${url}`);
    console.log(`Method: ${options.method || 'GET'}`);
    console.log('Headers:', options.headers);
    if (options.body) {
      console.log('Body:', options.body);
    }
    console.log('---');
  }

  private async logResponse(response: Response): Promise<void> {
    console.log('📡 API Response:');
    console.log(`Status: ${response.status}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    try {
      const responseText = await response.text();
      console.log('Body:', responseText);
    } catch {
      console.log('Body: [Unable to read]');
    }
    console.log('---');
  }
}
