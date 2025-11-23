# QRadar MCP Server - End-to-End Technical Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [API Reference](#api-reference)
6. [Configuration Management](#configuration-management)
7. [Security Architecture](#security-architecture)
8. [Error Handling & Resilience](#error-handling--resilience)
9. [Deployment Guide](#deployment-guide)
10. [Development Guide](#development-guide)
11. [Testing Strategy](#testing-strategy)
12. [Monitoring & Observability](#monitoring--observability)
13. [Troubleshooting](#troubleshooting)
14. [Performance Considerations](#performance-considerations)
15. [Extension & Customization](#extension--customization)

---

## Executive Summary

### What is QRadar MCP Server?

The QRadar MCP Server is a **Model Context Protocol (MCP)** implementation that exposes IBM QRadar's REST APIs as standardized MCP tools. It acts as a bridge between AI-powered applications (like AI IDEs, chatbots, or agent runtimes) and QRadar's security information and event management (SIEM) platform.

### Key Capabilities

- **11 MCP Tools**: Comprehensive coverage of QRadar operations including offenses, Ariel searches, log sources, reference sets, and system health
- **Secure Authentication**: Token-based authentication with configurable TLS verification
- **Resilient Communication**: Built-in retry logic, rate limiting, and exponential backoff
- **UI Integration**: Every response includes deeplinks to the QRadar web interface
- **Production-Ready**: Docker support, structured logging, and comprehensive error handling

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ |
| Language | TypeScript | 5.3+ |
| MCP SDK | @modelcontextprotocol/sdk | 1.22.0 |
| HTTP Client | undici | 5.28.2 |
| Validation | Zod | 3.25.76 |
| Container | Docker | Latest |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Client Layer                         │
│  (AI IDEs, Chatbots, Agent Runtimes, Custom Applications)  │
└────────────────────┬────────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                QRadar MCP Server                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MCP Server Core                          │  │
│  │  - Tool Registration                                  │  │
│  │  - Schema Validation (Zod)                           │  │
│  │  - Request/Response Handling                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │              Tool Implementations                     │  │
│  │  - listOffenses      - searchAriel                   │  │
│  │  - getOffense        - listLogSources                │  │
│  │  - listReferenceSets - getReferenceSet               │  │
│  │  - addReferenceSetItem - deleteReferenceSetItem      │  │
│  │  - listSavedSearches - runSavedSearch                │  │
│  │  - systemHealthSummary                               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │           QRadar Client (HTTP Layer)                  │  │
│  │  - Authentication (SEC Token)                        │  │
│  │  - Rate Limiting                                     │  │
│  │  - Retry Logic (Exponential Backoff)                │  │
│  │  - TLS Configuration                                 │  │
│  │  - Error Handling                                    │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │           Utility Components                          │  │
│  │  - Configuration Manager (Zod Validation)            │  │
│  │  - Deeplink Builder (UI Links)                       │  │
│  │  - Type Definitions (TypeScript Interfaces)          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  IBM QRadar SIEM                             │
│  - REST API Endpoints                                        │
│  - Event/Flow Database (Ariel)                              │
│  - Offense Management                                        │
│  - Reference Data                                            │
│  - Log Source Management                                     │
└──────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
Client Request → MCP Server → Tool Handler → QRadar Client → QRadar API
                                                    ↓
Client Response ← MCP Server ← Tool Response ← HTTP Response
```

---

## System Components

### 1. MCP Server Core (`src/index.ts`)

**Purpose**: Main entry point that initializes the MCP server and registers all tools.

**Key Responsibilities**:
- Initialize MCP server with metadata (name, version)
- Register 11 tools with their schemas and handlers
- Set up stdio transport for MCP communication
- Handle server lifecycle and error recovery

**Code Structure**:
```typescript
async function startServer() {
  const server = new McpServer({
    name: 'qradar-mcp-server',
    version: '1.0.0',
  });

  // Register tools
  server.registerTool('list_offenses', {...}, handler);
  // ... 10 more tools

  // Start stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

**Transport Protocol**: Uses stdio (standard input/output) for communication, making it compatible with MCP clients that spawn the server as a subprocess.

### 2. Configuration Manager (`src/config/index.ts`)

**Purpose**: Centralized configuration management with validation.

**Features**:
- Loads environment variables from `.env` file
- Validates all configuration using Zod schemas
- Provides type-safe configuration object
- Fails fast on invalid configuration

**Configuration Schema**:
```typescript
const configSchema = z.object({
  // QRadar Connection
  QRADAR_API_BASE_URL: z.string().url(),
  QRADAR_UI_BASE_URL: z.string().url(),
  QRADAR_API_TOKEN: z.string().min(1),
  QRADAR_AUTH_HEADER: z.string().default('SEC'),
  QRADAR_API_VERSION: z.string().default('18.0'),
  
  // TLS
  QRADAR_TLS_VERIFY: z.boolean().default(true),
  QRADAR_CA_PATH: z.string().optional(),
  
  // Server
  PORT: z.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Resilience
  RATE_LIMIT_MAX: z.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.number().int().positive().default(60000),
  RETRY_MAX_ATTEMPTS: z.number().int().positive().default(3),
  RETRY_INITIAL_DELAY_MS: z.number().int().positive().default(1000),
});
```

### 3. QRadar Client (`src/utils/qradarClient.ts`)

**Purpose**: HTTP client for QRadar REST API with enterprise-grade features.

**Architecture**:
```typescript
class QRadarClient {
  private baseUrl: string;
  private authHeader: string;
  private apiToken: string;
  private dispatcher?: Dispatcher; // For custom TLS
  
  // Core request method with retry logic
  async request<T>(endpoint, options): Promise<T>
  
  // Convenience methods
  async get<T>(endpoint, params): Promise<T>
  async post<T>(endpoint, body): Promise<T>
  async put<T>(endpoint, body): Promise<T>
  async delete<T>(endpoint): Promise<T>
}
```

**Key Features**:

1. **Authentication**:
   - Injects SEC token in request headers
   - Configurable auth header name
   - API version header support

2. **TLS Configuration**:
   - Configurable certificate verification
   - Custom CA certificate support
   - Uses undici Agent for TLS customization

3. **Retry Logic**:
   - Exponential backoff for 429 (rate limit) and 5xx errors
   - Configurable max attempts and initial delay
   - Formula: `delay = initialDelay * 2^retryCount`

4. **Error Handling**:
   - Custom `QRadarApiError` class with status, code, and hint
   - Structured error responses
   - Network error detection

**Example Usage**:
```typescript
// GET request with parameters
const offenses = await qradarClient.get<Offense[]>(
  '/siem/offenses',
  { status: 'OPEN', limit: 10 }
);

// POST request with body
const search = await qradarClient.post<SearchResponse>(
  '/ariel/searches',
  { query_expression: 'SELECT * FROM events LAST 1 HOURS' }
);
```

### 4. Deeplink Builder (`src/utils/deeplinks.ts`)

**Purpose**: Generate QRadar UI deeplinks for seamless navigation.

**Supported Deeplinks**:
- Offense list page (with optional filters)
- Specific offense details
- Ariel search page (with optional AQL query)
- Log sources page
- Specific log source details
- Reference sets page
- Specific reference set details
- Saved searches page (by type)
- System health page

**Implementation**:
```typescript
class DeeplinkBuilder {
  private baseUrl: string;
  
  offensesPage(filter?: string): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'SEM');
    url.searchParams.append('pageId', 'OffenseList');
    if (filter) url.searchParams.append('filter', filter);
    return url.toString();
  }
  
  // ... 8 more deeplink methods
}
```

### 5. Type Definitions (`src/types/qradar.ts`)

**Purpose**: TypeScript interfaces for QRadar API responses.

**Key Types**:
- `Offense`: Security offense object
- `LogSource`: Log source configuration
- `ReferenceSet`: Reference data set
- `ReferenceSetItem`: Individual reference set entry
- `SavedSearch`: Saved Ariel query
- `ArielSearchStatus`: Search execution status
- `SystemHealthSummary`: System health metrics

**Design Pattern**: All types include `[key: string]: any` to allow additional properties from QRadar API responses.

### 6. Tool Implementations (`src/tools/`)

Each tool follows a consistent pattern:

```typescript
// 1. Input schema with Zod
export const toolInputSchema = z.object({
  param1: z.string().describe('Description'),
  param2: z.number().optional().default(50),
});

// 2. Output schema with Zod
export const toolOutputSchema = z.object({
  items: z.array(z.any()),
  ui_link: z.string().optional(),
});

// 3. Type inference
export type ToolInput = z.infer<typeof toolInputSchema>;
export type ToolOutput = z.infer<typeof toolOutputSchema>;

// 4. Implementation function
export async function toolFunction(input: ToolInput): Promise<ToolOutput> {
  // Build parameters
  const params = { /* ... */ };
  
  // Call QRadar API
  const response = await qradarClient.get('/endpoint', params);
  
  // Generate UI link
  const uiLink = deeplinkBuilder.method();
  
  // Return structured response
  return { items: response, ui_link: uiLink };
}
```

---

## Data Flow

### Request Flow (Detailed)

```
1. MCP Client sends tool invocation
   ↓
2. MCP Server receives request via stdio
   ↓
3. Server validates input against Zod schema
   ↓
4. Tool handler is invoked with validated input
   ↓
5. Tool builds QRadar API parameters
   ↓
6. QRadarClient prepares HTTP request:
   - Adds authentication headers
   - Builds URL with query parameters
   - Configures TLS settings
   ↓
7. HTTP request sent to QRadar API
   ↓
8. QRadar processes request and returns response
   ↓
9. QRadarClient handles response:
   - Checks status code
   - Parses JSON response
   - Handles errors (retry if needed)
   ↓
10. Tool processes response:
    - Transforms data if needed
    - Generates UI deeplink
    - Structures output
    ↓
11. Output validated against Zod schema
    ↓
12. MCP Server sends response via stdio
    ↓
13. MCP Client receives structured response
```

### Error Flow

```
Error occurs at any step
   ↓
QRadarClient catches error
   ↓
Is it retryable? (429, 5xx)
   ├─ Yes → Wait (exponential backoff) → Retry
   └─ No → Throw QRadarApiError
          ↓
Tool handler catches error
   ↓
Returns error response or empty result
   ↓
MCP Server sends error to client
```

---

## API Reference

### Tool 1: list_offenses

**Description**: List offenses from QRadar with optional filtering and pagination.

**Input Parameters**:
```typescript
{
  filter?: string;        // QRadar filter expression
  status?: 'OPEN' | 'CLOSED' | 'HIDDEN';
  start?: number;         // Pagination start index (default: 0)
  limit?: number;         // Max items (default: 50, max: 1000)
  fields?: string[];      // Fields to include in response
}
```

**Output**:
```typescript
{
  items: Offense[];       // Array of offense objects
  next_start?: number;    // Next page start index
  ui_link?: string;       // QRadar UI link
}
```

**Example**:
```json
{
  "tool": "list_offenses",
  "parameters": {
    "status": "OPEN",
    "limit": 10
  }
}
```

**QRadar API Endpoint**: `GET /api/siem/offenses`

---

### Tool 2: get_offense

**Description**: Get detailed information about a specific offense.

**Input Parameters**:
```typescript
{
  offense_id: number;     // Offense ID (required)
  fields?: string[];      // Fields to include
}
```

**Output**:
```typescript
{
  offense: Offense;       // Full offense object
  ui_link?: string;       // Link to offense details page
}
```

**QRadar API Endpoint**: `GET /api/siem/offenses/{offense_id}`

---

### Tool 3: search_ariel

**Description**: Execute an Ariel Query Language (AQL) search against events or flows.

**Input Parameters**:
```typescript
{
  aql: string;            // AQL query (required)
  timeout_ms?: number;    // Timeout in milliseconds (default: 30000)
}
```

**Output**:
```typescript
{
  status: 'COMPLETED' | 'RUNNING' | 'FAILED';
  rows?: any[];           // Result rows (if completed)
  search_id?: string;     // Search ID (if still running)
  ui_link?: string;       // Link to search results
}
```

**Implementation Details**:
1. Submits search to QRadar (`POST /api/ariel/searches`)
2. Polls search status every 1 second
3. Returns results when completed or search_id if timeout reached
4. Handles COMPLETED, ERROR, and CANCELED states

**Example**:
```json
{
  "tool": "search_ariel",
  "parameters": {
    "aql": "SELECT sourceip, destinationip FROM events LAST 1 HOURS",
    "timeout_ms": 60000
  }
}
```

**QRadar API Endpoints**:
- `POST /api/ariel/searches` - Start search
- `GET /api/ariel/searches/{search_id}` - Check status
- `GET /api/ariel/searches/{search_id}/results` - Get results

---

### Tool 4: list_log_sources

**Description**: List log sources with optional filtering.

**Input Parameters**:
```typescript
{
  type_id?: number;       // Filter by log source type ID
  name_contains?: string; // Filter by name (case-insensitive)
  start?: number;         // Pagination start
  limit?: number;         // Max items (default: 50)
}
```

**Output**:
```typescript
{
  items: LogSource[];     // Array of log sources
  next_start?: number;    // Next page start
  ui_link?: string;       // Link to log sources page
}
```

**Filter Construction**:
- `type_id`: Creates filter `type_id = {value}`
- `name_contains`: Creates filter `name ilike '%{value}%'`
- Combined with AND if both provided

**QRadar API Endpoint**: `GET /api/config/event_sources/log_source_management/log_sources`

---

### Tool 5: list_reference_sets

**Description**: List reference sets with optional name filtering.

**Input Parameters**:
```typescript
{
  name_contains?: string; // Filter by name
  start?: number;         // Pagination start
  limit?: number;         // Max items (default: 50)
}
```

**Output**:
```typescript
{
  items: ReferenceSet[];  // Array of reference sets
  next_start?: number;    // Next page start
  ui_link?: string;       // Link to reference sets page
}
```

**QRadar API Endpoint**: `GET /api/reference_data/sets`

---

### Tool 6: get_reference_set

**Description**: Get details and contents of a specific reference set.

**Input Parameters**:
```typescript
{
  name: string;           // Reference set name (required)
}
```

**Output**:
```typescript
{
  reference_set: ReferenceSet;  // Reference set metadata
  data: ReferenceSetItem[];     // Items in the set
  ui_link?: string;             // Link to reference set details
}
```

**QRadar API Endpoint**: `GET /api/reference_data/sets/{name}`

---

### Tool 7: add_reference_set_item

**Description**: Add an item to a reference set.

**Input Parameters**:
```typescript
{
  name: string;           // Reference set name (required)
  value: string | number; // Value to add (required)
  source?: string;        // Source attribution
  time_to_live?: string;  // TTL (e.g., "1 month", "30 days")
}
```

**Output**:
```typescript
{
  success: boolean;       // Operation success
  reference_set: string;  // Reference set name
  value: string | number; // Added value
  ui_link?: string;       // Link to reference set
}
```

**QRadar API Endpoint**: `POST /api/reference_data/sets/{name}`

---

### Tool 8: delete_reference_set_item

**Description**: Remove an item from a reference set.

**Input Parameters**:
```typescript
{
  name: string;           // Reference set name (required)
  value: string | number; // Value to delete (required)
}
```

**Output**:
```typescript
{
  success: boolean;       // Operation success
  reference_set: string;  // Reference set name
  value: string | number; // Deleted value
  ui_link?: string;       // Link to reference set
}
```

**QRadar API Endpoint**: `DELETE /api/reference_data/sets/{name}/{value}`

---

### Tool 9: list_saved_searches

**Description**: List saved Ariel searches.

**Input Parameters**:
```typescript
{
  type: 'EVENT' | 'FLOW'; // Search type (required)
  start?: number;         // Pagination start
  limit?: number;         // Max items (default: 50)
}
```

**Output**:
```typescript
{
  items: SavedSearch[];   // Array of saved searches
  next_start?: number;    // Next page start
  ui_link?: string;       // Link to saved searches page
}
```

**QRadar API Endpoint**: `GET /api/ariel/saved_searches`

---

### Tool 10: run_saved_search

**Description**: Execute a saved search by ID.

**Input Parameters**:
```typescript
{
  search_id: string;      // Saved search ID (required)
  timeout_ms?: number;    // Timeout (default: 60000)
}
```

**Output**:
```typescript
{
  status: 'COMPLETED' | 'RUNNING' | 'FAILED';
  rows?: any[];           // Result rows
  search_id?: string;     // Search ID
  ui_link?: string;       // Link to results
}
```

**Implementation**: Similar to `search_ariel` but uses saved search ID instead of AQL.

**QRadar API Endpoints**:
- `POST /api/ariel/saved_searches/{id}/results`
- `GET /api/ariel/searches/{search_id}` - Check status
- `GET /api/ariel/searches/{search_id}/results` - Get results

---

### Tool 11: system_health_summary

**Description**: Get QRadar system health information.

**Input Parameters**: None

**Output**:
```typescript
{
  deployment: {
    console_ip: string;
    deployment_name: string;
    deployment_virtual: boolean;
    hostname: string;
    hostid: number;
  };
  metrics: {
    average_eps: number;
    rules_failing: number;
    flows_dropped: number;
    events_dropped: number;
    flows_processed: number;
    events_processed: number;
  };
  status: {
    overall_status: 'GREEN' | 'YELLOW' | 'RED';
    services: Array<{
      name: string;
      status: 'RUNNING' | 'STOPPED' | 'ERROR';
      pid?: number;
    }>;
  };
  ui_link?: string;
}
```

**QRadar API Endpoint**: `GET /api/system/servers` (aggregated from multiple endpoints)

---

## Configuration Management

### Environment Variables

All configuration is managed through environment variables, validated at startup.

**Required Variables**:
```bash
QRADAR_API_BASE_URL=https://qradar.example.com/api
QRADAR_UI_BASE_URL=https://qradar.example.com
QRADAR_API_TOKEN=your-sec-token-here
```

**Optional Variables with Defaults**:
```bash
# Authentication
QRADAR_AUTH_HEADER=SEC              # Header name for API token
QRADAR_API_VERSION=18.0             # QRadar API version

# TLS Configuration
QRADAR_TLS_VERIFY=true              # Verify TLS certificates
QRADAR_CA_PATH=                     # Path to CA certificate

# Server Configuration
PORT=3000                           # Server port
HOST=0.0.0.0                        # Server host
LOG_LEVEL=info                      # Logging level

# Rate Limiting
RATE_LIMIT_MAX=100                  # Max requests per window
RATE_LIMIT_WINDOW_MS=60000          # Rate limit window (1 minute)

# Retry Configuration
RETRY_MAX_ATTEMPTS=3                # Max retry attempts
RETRY_INITIAL_DELAY_MS=1000         # Initial retry delay
```

### Configuration Validation

The configuration system uses Zod for runtime validation:

```typescript
// Validation happens at startup
const parseResult = configSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);  // Fail fast
}

export const appConfig = parseResult.data;
```

**Benefits**:
- Type-safe configuration access
- Automatic type coercion (strings to numbers/booleans)
- Clear error messages for invalid configuration
- Prevents runtime errors from misconfiguration

---

## Security Architecture

### Authentication

**Token-Based Authentication**:
- Uses QRadar SEC tokens
- Token injected in configurable header (default: `SEC`)
- Token never logged or exposed in responses
- Supports custom authentication headers

**Token Generation** (QRadar Console):
1. Navigate to Admin → Authorized Services
2. Create new authorized service
3. Generate SEC token
4. Copy token to `.env` file

### TLS/SSL Configuration

**Certificate Verification**:
```bash
# Production (verify certificates)
QRADAR_TLS_VERIFY=true

# Development (allow self-signed)
QRADAR_TLS_VERIFY=false

# Custom CA certificate
QRADAR_TLS_VERIFY=true
QRADAR_CA_PATH=/path/to/ca.crt
```

**Implementation**:
```typescript
const connectOptions: any = {
  rejectUnauthorized: this.tlsVerify,
};

if (this.caPath) {
  const caData = fs.readFileSync(this.caPath);
  connectOptions.ca = caData;
}

const dispatcher = new Agent({ connect: connectOptions });
```

### Input Validation

**Schema-Based Validation**:
- All tool inputs validated with Zod schemas
- Type coercion and transformation
- Descriptive error messages
- Prevents injection attacks

**Example**:
```typescript
const inputSchema = z.object({
  offense_id: z.number().int().positive(),
  fields: z.array(z.string()).optional(),
});

// Validation happens automatically
const validated = inputSchema.parse(userInput);
```

### Secrets Management

**Best Practices**:
1. Never commit `.env` file to version control
2. Use `.env.example` as template
3. Rotate API tokens regularly
4. Use environment-specific tokens
5. Consider using secrets management tools (AWS Secrets Manager, HashiCorp Vault)

**Docker Secrets**:
```yaml
# docker-compose.yml
services:
  qradar-mcp-server:
    environment:
      - QRADAR_API_TOKEN_FILE=/run/secrets/qradar_token
    secrets:
      - qradar_token

secrets:
  qradar_token:
    external: true
```

---

## Error Handling & Resilience

### Error Types

**1. QRadarApiError**:
```typescript
class QRadarApiError extends Error {
  status: number;    // HTTP status code
  code: string;      // Error code (e.g., 'HTTP_401')
  hint?: string;     // Helpful hint for resolution
}
```

**2. Network Errors**:
- Connection refused
- Timeout
- DNS resolution failure

**3. Validation Errors**:
- Invalid input parameters
- Schema validation failure

### Retry Strategy

**Exponential Backoff**:
```typescript
// Retry on 429 (rate limit) and 5xx errors
if (statusCode === 429 || statusCode >= 500) {
  if (retryCount < maxRetries) {
    const delay = initialDelay * Math.pow(2, retryCount);
    await sleep(delay);
    return retry(retryCount + 1);
  }
}
```

**Retry Schedule** (default configuration):
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay
- Attempt 4: 4 seconds delay
- Give up after 4 attempts

### Rate Limiting

**Client-Side Rate Limiting**:
- Configurable max requests per window
- Default: 100 requests per 60 seconds
- Prevents overwhelming QRadar API

**Implementation Considerations**:
- Current implementation relies on QRadar's rate limiting
- Future enhancement: Add client-side rate limiter

### Circuit Breaker Pattern

**Future Enhancement**:
```typescript
class CircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

---

## Deployment Guide

### Local Development

**Prerequisites**:
- Node.js 18 or higher
- npm or yarn
- Access to QRadar instance

**Steps**:
```bash
# 1. Clone repository
git clone https://github.com/your-org/qradar-mcp-server.git
cd qradar-mcp-server

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your QRadar details

# 4. Build TypeScript
npm run build

# 5. Start server
npm start
```

### Docker Deployment

**Build Image**:
```bash
docker build -t qradar-mcp-server:latest .
```

**Run Container**:
```bash
docker run -d \
  --name qradar-mcp-server \
  -p 3000:3000 \
  --env-file .env \
  qradar-mcp-server:latest
```

**Docker Compose**:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

**Kubernetes Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qradar-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: qradar-mcp-server
  template:
    metadata:
      labels:
        app: qradar-mcp-server
    spec:
      containers:
      - name: qradar-mcp-server
        image: qradar-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: QRADAR_API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: qradar-config
              key: api-base-url
        - name: QRADAR_API_TOKEN
          valueFrom:
            secretKeyRef:
              name: qradar-secrets
              key: api-token
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**ConfigMap**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: qradar-config
data:
  api-base-url: "https://qradar.example.com/api"
  ui-base-url: "https://qradar.example.com"
  api-version: "18.0"
  log-level: "info"
```

**Secret**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: qradar-secrets
type: Opaque
stringData:
  api-token: "your-sec-token-here"
```

### Health Checks

**Liveness Probe**:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**Readiness Probe**:
```typescript
app.get('/ready', async (req, res) => {
  try {
    // Check QRadar connectivity
    await qradarClient.get('/system/about');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

---

## Development Guide

### Project Structure

```
qradar-mcp-server/
├── src/
│   ├── config/
│   │   └── index.ts              # Configuration management
│   ├── tools/
│   │   ├── listOffenses.ts       # Offense listing tool
│   │   ├── getOffense.ts         # Offense details tool
│   │   ├── searchAriel.ts        # Ariel search tool
│   │   ├── listLogSources.ts     # Log sources tool
│   │   ├── listReferenceSets.ts  # Reference sets listing
│   │   ├── getReferenceSet.ts    # Reference set details
│   │   ├── addReferenceSetItem.ts    # Add to reference set
│   │   ├── deleteReferenceSetItem.ts # Delete from reference set
│   │   ├── listSavedSearches.ts  # Saved searches listing
│   │   ├── runSavedSearch.ts     # Run saved search
│   │   └── systemHealthSummary.ts # System health
│   ├── types/
│   │   └── qradar.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── qradarClient.ts       # HTTP client
│   │   └── deeplinks.ts          # UI link generator
│   └── index.ts                  # Main entry point
├── test/
│   └── integration.test.ts       # Integration tests
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Docker Compose config
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # Project documentation
```

### Adding a New Tool

**Step 1: Create Tool File** (`src/tools/myNewTool.ts`):
```typescript
import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';

// Define input schema
export const myNewToolInputSchema = z.object({
  param1: z.string().describe('Description of param1'),
  param2: z.number().optional().default(10),
});

// Define output schema
export const myNewToolOutputSchema = z.object({
  result: z.any(),
  ui_link: z.string().optional(),
});

// Type inference
export type MyNewToolInput = z.infer<typeof myNewToolInputSchema>;
export type MyNewToolOutput = z.infer<typeof myNewToolOutputSchema>;

// Implementation
export async function myNewTool(input: MyNewToolInput): Promise<MyNewToolOutput> {
  const { param1, param2 } = input;
  
  // Call QRadar API
  const response = await qradarClient.get('/api/endpoint', {
    param1,
    param2,
  });
  
  // Generate UI link
  const uiLink = deeplinkBuilder.customPage();
  
  return {
    result: response,
    ui_link: uiLink,
  };
}
```

**Step 2: Register Tool** (`src/index.ts`):
```typescript
import {
  myNewTool,
  myNewToolInputSchema,
  myNewToolOutputSchema,
} from './tools/myNewTool.js';

// In startServer() function
server.registerTool(
  'my_new_tool',
  {
    title: 'My New Tool',
    description: 'Description of what the tool does',
    inputSchema: myNewToolInputSchema,
    outputSchema: myNewToolOutputSchema,
  },
  async (args: any, _extra: any) => {
    const result = await myNewTool({
      param1: args.param1,
      param2: args.param2,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
      structuredContent: result,
    };
  },
);
```

**Step 3: Add Type Definition** (if needed) (`src/types/qradar.ts`):
```typescript
export interface MyNewType {
  id: number;
  name: string;
  // ... other fields
  [key: string]: any;
}
```

**Step 4: Add Deeplink Method** (if needed) (`src/utils/deeplinks.ts`):
```typescript
customPage(param?: string): string {
  const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
  url.searchParams.append('appName', 'MyApp');
  url.searchParams.append('pageId', 'MyPage');
  if (param) url.searchParams.append('param', param);
  return url.toString();
}
```

### Code Style Guidelines

**TypeScript**:
- Use strict mode
- Prefer interfaces over types for object shapes
- Use `async/await` over promises
- Add JSDoc comments for public APIs

**Naming Conventions**:
- Files: camelCase (e.g., `listOffenses.ts`)
- Classes: PascalCase (e.g., `QRadarClient`)
- Functions: camelCase (e.g., `listOffenses`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- Interfaces: PascalCase (e.g., `Offense`)

**Error Handling**:
- Always catch and handle errors
- Use custom error classes
- Provide helpful error messages
- Log errors with context

### Testing

**Unit Tests**:
```typescript
import { listOffenses } from '../src/tools/listOffenses';
import { qradarClient } from '../src/utils/qradarClient';

jest.mock('../src/utils/qradarClient');

describe('listOffenses', () => {
  it('should list offenses with default parameters', async () => {
    const mockOffenses = [{ id: 1, description: 'Test' }];
    (qradarClient.get as jest.Mock).mockResolvedValue(mockOffenses);
    
    const result = await listOffenses({ limit: 10 });
    
    expect(result.items).toEqual(mockOffenses);
    expect(result.ui_link).toBeDefined();
  });
});
```

**Integration Tests**:
```typescript
describe('QRadar MCP Server Integration', () => {
  it('should connect to QRadar and list offenses', async () => {
    const result = await listOffenses({
      status: 'OPEN',
      limit: 5,
    });
    
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items.length).toBeLessThanOrEqual(5);
  });
});
```

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /Integration\
   /--------------\
  /   Unit Tests   \
 /------------------\
```

### Unit Tests

**Coverage Areas**:
- Configuration validation
- Input schema validation
- Output schema validation
- Error handling
- Utility functions

**Example**:
```typescript
describe('Configuration', () => {
  it('should validate required environment variables', () => {
    const invalidEnv = { ...process.env };
    delete invalidEnv.QRADAR_API_BASE_URL;
    
    expect(() => {
      configSchema.parse(invalidEnv);
    }).toThrow();
  });
});
```

### Integration Tests

**Coverage Areas**:
- QRadar API connectivity
- Tool execution end-to-end
- Error scenarios
- Retry logic

**Setup**:
```typescript
beforeAll(async () => {
  // Set up test environment
  process.env.QRADAR_API_BASE_URL = 'https://test-qradar.example.com/api';
  process.env.QRADAR_API_TOKEN = 'test-token';
});

afterAll(async () => {
  // Clean up
});
```

### Manual Testing

**Test Scripts** (in repository):
```bash
# Test connection
node test-connection.js

# Test specific tool
node test-offenses.js

# Test Ariel search
node test-ariel.js
```

**Example Test Script**:
```javascript
// test-offenses.js
import { listOffenses } from './dist/tools/listOffenses.js';

async function test() {
  try {
    const result = await listOffenses({
      status: 'OPEN',
      limit: 5,
    });
    console.log('Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

---

## Monitoring & Observability

### Logging

**Log Levels**:
- `debug`: Detailed diagnostic information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages

**Log Format**:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "QRadar API request",
  "context": {
    "method": "GET",
    "endpoint": "/siem/offenses",
    "duration_ms": 245
  }
}
```

**Implementation**:
```typescript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'Request completed',
  context: { endpoint, duration },
}));
```

### Metrics

**Key Metrics to Track**:
- Request count by tool
- Request duration (p50, p95, p99)
- Error rate by type
- QRadar API response times
- Retry attempts
- Rate limit hits

**Prometheus Integration** (future enhancement):
```typescript
import { Counter, Histogram } from 'prom-client';

const requestCounter = new Counter({
  name: 'qradar_mcp_requests_total',
  help: 'Total number of requests',
  labelNames: ['tool', 'status'],
});

const requestDuration = new Histogram({
  name: 'qradar_mcp_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['tool'],
});
```

### Distributed Tracing

**OpenTelemetry Integration** (future enhancement):
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('qradar-mcp-server');

async function listOffenses(input) {
  const span = tracer.startSpan('listOffenses');
  try {
    // ... implementation
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Symptoms**:
```
Error: connect ECONNREFUSED 192.168.1.100:443
```

**Causes**:
- QRadar instance is down
- Incorrect API base URL
- Network connectivity issues
- Firewall blocking connection

**Solutions**:
```bash
# Test connectivity
curl -k https://qradar.example.com/api/help/versions

# Check DNS resolution
nslookup qradar.example.com

# Verify firewall rules
telnet qradar.example.com 443
```

#### 2. Authentication Errors

**Symptoms**:
```json
{
  "error": "QRadarApiError",
  "message": "Unauthorized",
  "status": 401,
  "code": "HTTP_401"
}
```

**Causes**:
- Invalid API token
- Expired token
- Incorrect auth header name
- Insufficient permissions

**Solutions**:
```bash
# Test token manually
curl -H "SEC: your-token" \
  https://qradar.example.com/api/system/about

# Regenerate token in QRadar Console
# Admin → Authorized Services → Create New

# Verify auth header name
echo $QRADAR_AUTH_HEADER  # Should be 'SEC'
```

#### 3. TLS/SSL Errors

**Symptoms**:
```
Error: self signed certificate
Error: unable to verify the first certificate
```

**Causes**:
- Self-signed certificate
- Missing CA certificate
- Certificate verification enabled

**Solutions**:
```bash
# Option 1: Disable verification (development only)
QRADAR_TLS_VERIFY=false

# Option 2: Provide CA certificate
QRADAR_TLS_VERIFY=true
QRADAR_CA_PATH=/path/to/ca.crt

# Option 3: Add certificate to system trust store
# (OS-specific)
```

#### 4. Rate Limiting

**Symptoms**:
```json
{
  "error": "QRadarApiError",
  "message": "Too Many Requests",
  "status": 429,
  "code": "HTTP_429"
}
```

**Causes**:
- Exceeding QRadar API rate limits
- Too many concurrent requests

**Solutions**:
```bash
# Increase retry delay
RETRY_INITIAL_DELAY_MS=2000

# Reduce request rate
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW_MS=60000

# Implement request queuing in client
```

#### 5. Timeout Errors

**Symptoms**:
```
Error: Request timeout
```

**Causes**:
- Long-running Ariel searches
- Slow QRadar response
- Network latency

**Solutions**:
```typescript
// Increase timeout for specific operations
await searchAriel({
  aql: 'SELECT * FROM events LAST 7 DAYS',
  timeout_ms: 300000,  // 5 minutes
});

// Use pagination for large result sets
await listOffenses({
  limit: 50,  // Smaller page size
  start: 0,
});
```

### Debug Mode

**Enable Debug Logging**:
```bash
LOG_LEVEL=debug npm start
```

**Debug Output**:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "debug",
  "message": "QRadar API request",
  "context": {
    "method": "GET",
    "url": "https://qradar.example.com/api/siem/offenses",
    "headers": {
      "Accept": "application/json",
      "Version": "18.0",
      "SEC": "[REDACTED]"
    },
    "params": {
      "status": "OPEN",
      "limit": 10
    }
  }
}
```

### Health Check Endpoints

**Check Server Health**:
```bash
curl http://localhost:3000/health
```

**Check QRadar Connectivity**:
```bash
curl http://localhost:3000/ready
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Connection Pooling

**Current**: Uses undici's built-in connection pooling

**Configuration**:
```typescript
const dispatcher = new Agent({
  connections: 100,        // Max connections
  pipelining: 10,          // Requests per connection
  keepAliveTimeout: 60000, // Keep-alive timeout
});
```

#### 2. Response Caching

**Future Enhancement**:
```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,              // Max items
  ttl: 60000,            // 1 minute TTL
});

async function listOffenses(input) {
  const cacheKey = JSON.stringify(input);
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const result = await fetchFromQRadar(input);
  cache.set(cacheKey, result);
  return result;
}
```

#### 3. Request Batching

**Future Enhancement**:
```typescript
class RequestBatcher {
  private queue: Array<Request> = [];
  private timer?: NodeJS.Timeout;
  
  add(request: Request): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.scheduleFlush();
    });
  }
  
  private scheduleFlush() {
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), 100);
  }
  
  private async flush() {
    const batch = this.queue.splice(0, 10);
    // Execute batch request
  }
}
```

#### 4. Pagination Best Practices

**Efficient Pagination**:
```typescript
// Good: Use reasonable page sizes
await listOffenses({ limit: 50 });

// Bad: Requesting too many items
await listOffenses({ limit: 10000 });

// Good: Iterate through pages
let start = 0;
const limit = 50;
while (true) {
  const result = await listOffenses({ start, limit });
  if (result.items.length === 0) break;
  // Process items
  start += limit;
}
```

### Performance Metrics

**Target Metrics**:
- API response time: < 500ms (p95)
- Tool execution time: < 2s (p95)
- Memory usage: < 512MB
- CPU usage: < 50%

**Monitoring**:
```typescript
const startTime = Date.now();
const result = await qradarClient.get('/endpoint');
const duration = Date.now() - startTime;

console.log(`Request completed in ${duration}ms`);
```

---

## Extension & Customization

### Custom Tools

**Example: Custom Threat Intelligence Tool**:
```typescript
// src/tools/getThreatIntel.ts
export const getThreatIntelInputSchema = z.object({
  indicator: z.string(),
  indicator_type: z.enum(['IP', 'DOMAIN', 'HASH']),
});

export async function getThreatIntel(input) {
  // 1. Query QRadar reference sets
  const refSets = await qradarClient.get('/reference_data/sets');
  
  // 2. Check if indicator exists
  const matches = refSets.filter(set => 
    set.name.includes('threat') || set.name.includes('malicious')
  );
  
  // 3. Return threat intelligence
  return {
    indicator: input.indicator,
    found: matches.length > 0,
    sources: matches.map(m => m.name),
  };
}
```

### Custom Middleware

**Example: Request Logging Middleware**:
```typescript
class RequestLogger {
  async log(request: Request, response: Response) {
    console.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      endpoint: request.endpoint,
      status: response.status,
      duration: response.duration,
    });
  }
}

// Integrate in QRadarClient
async request(endpoint, options) {
  const start = Date.now();
  const response = await fetch(endpoint, options);
  const duration = Date.now() - start;
  
  await requestLogger.log({ endpoint, ...options }, { 
    status: response.status, 
    duration 
  });
  
  return response;
}
```

### Custom Deeplinks

**Example: Custom Dashboard Link**:
```typescript
// src/utils/deeplinks.ts
customDashboard(dashboardId: number): string {
  const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
  url.searchParams.append('appName', 'Dashboard');
  url.searchParams.append('pageId', 'DashboardView');
  url.searchParams.append('dashboardId', dashboardId.toString());
  return url.toString();
}
```

### Plugin System

**Future Enhancement**:
```typescript
interface Plugin {
  name: string;
  version: string;
  init(server: McpServer): void;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.init(this.server);
  }
  
  unregister(name: string) {
    this.plugins.delete(name);
  }
}

// Usage
const threatIntelPlugin: Plugin = {
  name: 'threat-intel',
  version: '1.0.0',
  init(server) {
    server.registerTool('get_threat_intel', {...}, handler);
  },
};

pluginManager.register(threatIntelPlugin);
```

---

## Appendix

### A. QRadar API Version Compatibility

| QRadar Version | API Version | Supported |
|----------------|-------------|-----------|
| 7.5.0 | 18.0 | ✅ Yes |
| 7.4.x | 17.0 | ✅ Yes |
| 7.3.x | 16.0 | ⚠️ Partial |
| 7.2.x | 15.0 | ❌ No |

### B. Environment Variable Reference

Complete list of all environment variables with descriptions and defaults.

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `QRADAR_API_BASE_URL` | URL | Yes | - | QRadar API base URL |
| `QRADAR_UI_BASE_URL` | URL | Yes | - | QRadar UI base URL |
| `QRADAR_API_TOKEN` | String | Yes | - | API authentication token |
| `QRADAR_AUTH_HEADER` | String | No | `SEC` | Authentication header name |
| `QRADAR_API_VERSION` | String | No | `18.0` | QRadar API version |
| `QRADAR_TLS_VERIFY` | Boolean | No | `true` | Verify TLS certificates |
| `QRADAR_CA_PATH` | Path | No | - | Path to CA certificate |
| `PORT` | Number | No | `3000` | Server port |
| `HOST` | String | No | `0.0.0.0` | Server host |
| `LOG_LEVEL` | Enum | No | `info` | Logging level |
| `RATE_LIMIT_MAX` | Number | No | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | Number | No | `60000` | Rate limit window (ms) |
| `RETRY_MAX_ATTEMPTS` | Number | No | `3` | Max retry attempts |
| `RETRY_INITIAL_DELAY_MS` | Number | No | `1000` | Initial retry delay (ms) |

### C. QRadar API Endpoints

Complete mapping of tools to QRadar API endpoints.

| Tool | Method | Endpoint | Documentation |
|------|--------|----------|---------------|
| `list_offenses` | GET | `/api/siem/offenses` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--siem-offenses-GET.html) |
| `get_offense` | GET | `/api/siem/offenses/{id}` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--siem-offenses-offense_id-GET.html) |
| `search_ariel` | POST | `/api/ariel/searches` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--ariel-searches-POST.html) |
| `list_log_sources` | GET | `/api/config/event_sources/log_source_management/log_sources` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/) |
| `list_reference_sets` | GET | `/api/reference_data/sets` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--reference_data-sets-GET.html) |
| `get_reference_set` | GET | `/api/reference_data/sets/{name}` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--reference_data-sets-name-GET.html) |
| `add_reference_set_item` | POST | `/api/reference_data/sets/{name}` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--reference_data-sets-name-POST.html) |
| `delete_reference_set_item` | DELETE | `/api/reference_data/sets/{name}/{value}` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/) |
| `list_saved_searches` | GET | `/api/ariel/saved_searches` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--ariel-saved_searches-GET.html) |
| `run_saved_search` | POST | `/api/ariel/saved_searches/{id}/results` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/) |
| `system_health_summary` | GET | `/api/system/servers` | [Link](https://ibmsecuritydocs.github.io/qradar_api_18.0/18.0--system-servers-GET.html) |

### D. Error Codes

Common error codes and their meanings.

| Code | Status | Meaning | Resolution |
|------|--------|---------|------------|
| `HTTP_400` | 400 | Bad Request | Check input parameters |
| `HTTP_401` | 401 | Unauthorized | Verify API token |
| `HTTP_403` | 403 | Forbidden | Check permissions |
| `HTTP_404` | 404 | Not Found | Verify resource exists |
| `HTTP_422` | 422 | Unprocessable Entity | Validate input data |
| `HTTP_429` | 429 | Too Many Requests | Reduce request rate |
| `HTTP_500` | 500 | Internal Server Error | Check QRadar logs |
| `HTTP_503` | 503 | Service Unavailable | QRadar may be down |
| `NETWORK_ERROR` | 0 | Network Error | Check connectivity |

### E. Glossary

**AQL (Ariel Query Language)**: SQL-like query language for searching QRadar events and flows.

**Ariel**: QRadar's distributed database for storing and querying security events and network flows.

**DSM (Device Support Module)**: Parser that normalizes logs from specific security products.

**EPS (Events Per Second)**: Metric for event processing rate.

**MCP (Model Context Protocol)**: Open standard for AI model tool integration.

**Offense**: QRadar's term for a security incident or alert.

**Reference Set**: Collection of values (IPs, domains, hashes) used for correlation and enrichment.

**SEC Token**: QRadar's API authentication token.

**SIEM (Security Information and Event Management)**: Security platform that aggregates and analyzes security data.

---

## Document Information

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Author**: QRadar MCP Server Team  
**License**: MIT  

**Feedback**: For questions, issues, or contributions, please visit the [GitHub repository](https://github.com/your-org/qradar-mcp-server).

---

*Made with Bob*