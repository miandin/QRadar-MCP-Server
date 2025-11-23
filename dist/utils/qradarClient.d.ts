/**
 * Error class for QRadar API errors
 */
export declare class QRadarApiError extends Error {
    status: number;
    code: string;
    hint?: string;
    constructor(message: string, status: number, code: string, hint?: string);
}
/**
 * Request options for the low–level QRadar client
 */
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    retryCount?: number;
}
/**
 * Pagination parameters
 */
export interface PaginationParams {
    start?: number;
    limit?: number;
}
/**
 * QRadar API client with authentication, retry / backoff and error handling.
 *
 * This wraps undici.request while taking TLS configuration from appConfig.
 */
export declare class QRadarClient {
    private baseUrl;
    private authHeader;
    private apiToken;
    private apiVersion;
    private tlsVerify;
    private caPath?;
    private maxRetries;
    private initialDelay;
    private dispatcher?;
    constructor();
    /**
     * Build an undici Dispatcher (Agent) when we need custom TLS options.
     * If we are just using default verification and no custom CA, we can
     * skip a custom dispatcher entirely.
     */
    private createDispatcher;
    /**
     * Make an API request to QRadar
     */
    request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
    /**
     * Make a GET request
     */
    get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: Omit<RequestOptions, 'method' | 'params'>): Promise<T>;
    /**
     * Make a POST request
     */
    post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
    /**
     * Make a PUT request
     */
    put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
    /**
     * Make a DELETE request
     */
    delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T>;
}
export declare const qradarClient: QRadarClient;
export {};
