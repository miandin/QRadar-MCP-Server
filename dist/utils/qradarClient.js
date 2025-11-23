import { request, Agent } from 'undici';
import * as fs from 'node:fs';
import { appConfig } from '../config/index.js';
/**
 * Error class for QRadar API errors
 */
export class QRadarApiError extends Error {
    constructor(message, status, code, hint) {
        super(message);
        this.name = 'QRadarApiError';
        this.status = status;
        this.code = code;
        this.hint = hint;
    }
}
/**
 * QRadar API client with authentication, retry / backoff and error handling.
 *
 * This wraps undici.request while taking TLS configuration from appConfig.
 */
export class QRadarClient {
    constructor() {
        this.baseUrl = appConfig.QRADAR_API_BASE_URL;
        this.authHeader = appConfig.QRADAR_AUTH_HEADER;
        this.apiToken = appConfig.QRADAR_API_TOKEN;
        this.apiVersion = appConfig.QRADAR_API_VERSION;
        this.tlsVerify = appConfig.QRADAR_TLS_VERIFY;
        this.caPath = appConfig.QRADAR_CA_PATH;
        this.maxRetries = appConfig.RETRY_MAX_ATTEMPTS;
        this.initialDelay = appConfig.RETRY_INITIAL_DELAY_MS;
        this.dispatcher = this.createDispatcher();
    }
    /**
     * Build an undici Dispatcher (Agent) when we need custom TLS options.
     * If we are just using default verification and no custom CA, we can
     * skip a custom dispatcher entirely.
     */
    createDispatcher() {
        const needsCustomTls = !this.tlsVerify || !!this.caPath;
        if (!needsCustomTls) {
            return undefined;
        }
        const connectOptions = {
            // true = verify, false = allow self-signed
            rejectUnauthorized: this.tlsVerify,
        };
        if (this.caPath) {
            try {
                const caData = fs.readFileSync(this.caPath);
                connectOptions.ca = caData;
            }
            catch (err) {
                console.warn(`QRadarClient: failed to read CA file at ${this.caPath}:`, err);
            }
        }
        return new Agent({ connect: connectOptions });
    }
    /**
     * Make an API request to QRadar
     */
    async request(endpoint, options = {}) {
        const { method = 'GET', params, body, headers = {}, timeout = 30000, retryCount = 0, } = options;
        // Build URL with query parameters
        const url = new URL(endpoint, this.baseUrl);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        // Set up headers
        const requestHeaders = {
            Accept: 'application/json',
            Version: this.apiVersion,
            [this.authHeader]: this.apiToken,
            ...headers,
        };
        // Add Content-Type for requests with body
        if (body && !requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] = 'application/json';
        }
        // Build undici request options
        const undiciOptions = {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            bodyTimeout: timeout,
            headersTimeout: timeout,
        };
        if (this.dispatcher) {
            undiciOptions.dispatcher = this.dispatcher;
        }
        try {
            const response = await request(url.toString(), undiciOptions);
            // Handle successful response
            if (response.statusCode >= 200 && response.statusCode < 300) {
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('application/json')) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return (await response.body.json());
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return (await response.body.text());
            }
            // Try to parse an error body
            let errorData = {};
            try {
                errorData = await response.body.json();
            }
            catch {
                try {
                    errorData = { message: await response.body.text() };
                }
                catch {
                    errorData = {};
                }
            }
            const errorMessage = errorData.message ||
                errorData.error ||
                `Unknown QRadar API error (status ${response.statusCode})`;
            const errorCode = errorData.code || `HTTP_${String(response.statusCode)}`;
            const errorHint = errorData.description;
            // Handle rate limiting with exponential backoff
            if (response.statusCode === 429 && retryCount < this.maxRetries) {
                const delay = this.initialDelay * Math.pow(2, retryCount);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.request(endpoint, {
                    ...options,
                    retryCount: retryCount + 1,
                });
            }
            // Handle 5xx server errors with retry
            if (response.statusCode >= 500 && retryCount < this.maxRetries) {
                const delay = this.initialDelay * Math.pow(2, retryCount);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.request(endpoint, {
                    ...options,
                    retryCount: retryCount + 1,
                });
            }
            throw new QRadarApiError(errorMessage, response.statusCode, errorCode, errorHint);
        }
        catch (err) {
            if (err instanceof QRadarApiError) {
                throw err;
            }
            // Network or other unexpected error
            throw new QRadarApiError(err?.message ?? 'Unexpected QRadar client error', 0, 'NETWORK_ERROR');
        }
    }
    /**
     * Make a GET request
     */
    async get(endpoint, params, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'GET',
            params,
        });
    }
    /**
     * Make a POST request
     */
    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body,
        });
    }
    /**
     * Make a PUT request
     */
    async put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body,
        });
    }
    /**
     * Make a DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }
}
// Export singleton instance
export const qradarClient = new QRadarClient();
// Made with Bob
//# sourceMappingURL=qradarClient.js.map