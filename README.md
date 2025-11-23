# QRadar MCP Server

A Model Context Protocol (MCP) server that exposes IBM QRadar REST APIs as MCP tools. This server allows MCP-compatible clients (e.g., AI IDEs or agent runtimes) to query QRadar for offenses, Ariel searches, log sources, reference sets, and more, with results that include QRadar UI deeplinks for fast triage.

## What is MCP?

The [Model Context Protocol (MCP)](https://github.com/model-context-protocol/spec) is an open standard for defining tools that can be used by AI models. It provides a structured way for AI models to interact with external systems and data sources.

This server implements the MCP specification to expose QRadar's REST APIs as tools that can be used by MCP-compatible clients.

## Features

- **QRadar API Integration**: Connect to QRadar REST APIs with authentication, rate limiting, and error handling
- **MCP Tools**: Expose QRadar functionality as MCP tools with JSON Schema validation
- **UI Deeplinks**: Return QRadar UI links alongside API responses for quick access to the web interface
- **Security**: Configurable authentication, TLS verification, and secure handling of credentials
- **Observability**: Structured logging, request IDs, and timing information
- **Containerization**: Docker and docker-compose support for easy deployment

## Available Tools

The server provides the following MCP tools:

1. `list_offenses`: List offenses with optional filtering
2. `get_offense`: Get details of a specific offense by ID
3. `search_ariel`: Execute an Ariel query against events or flows
4. `list_log_sources`: List log sources with optional filtering
5. `list_reference_sets`: List reference sets with optional filtering
6. `get_reference_set`: Get a specific reference set by name
7. `add_reference_set_item`: Add an item to a reference set
8. `delete_reference_set_item`: Delete an item from a reference set
9. `list_saved_searches`: List saved searches of a specific type
10. `run_saved_search`: Run a saved search by ID
11. `system_health_summary`: Get a summary of system health information

## Installation

### Prerequisites

- Node.js 18+ or Docker
- Access to a QRadar instance with API credentials

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/qradar-mcp-server.git
   cd qradar-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your QRadar connection details:
   ```
   QRADAR_API_BASE_URL=https://your-qradar-instance.example.com/api
   QRADAR_UI_BASE_URL=https://your-qradar-instance.example.com
   QRADAR_API_TOKEN=your-api-token-here
   ```

5. Build and start the server:
   ```bash
   npm run build
   npm start
   ```

### Docker Setup

1. Create a `.env` file as described above.

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

## Configuration

The server can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `QRADAR_API_BASE_URL` | Base URL for QRadar API | (required) |
| `QRADAR_UI_BASE_URL` | Base URL for QRadar UI | (required) |
| `QRADAR_API_TOKEN` | API token for authentication | (required) |
| `QRADAR_AUTH_HEADER` | Header name for API token | `SEC` |
| `QRADAR_API_VERSION` | QRadar API version | `18.0` |
| `QRADAR_TLS_VERIFY` | Verify TLS certificates | `true` |
| `QRADAR_CA_PATH` | Path to CA certificate file | (optional) |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_MAX` | Maximum requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |
| `RETRY_MAX_ATTEMPTS` | Maximum retry attempts | `3` |
| `RETRY_INITIAL_DELAY_MS` | Initial retry delay in ms | `1000` |

## Usage

### Connecting an MCP Client

To connect an MCP client to this server, use the server's URL:

```
http://localhost:3000/mcp
```

### Example Tool Invocations

#### List Recent Offenses

```json
{
  "tool": "list_offenses",
  "parameters": {
    "status": "OPEN",
    "limit": 10
  }
}
```

#### Get Offense Details

```json
{
  "tool": "get_offense",
  "parameters": {
    "offense_id": 123
  }
}
```

#### Run an Ariel Search

```json
{
  "tool": "search_ariel",
  "parameters": {
    "aql": "SELECT sourceip, destinationip, username FROM events WHERE LOGSOURCENAME(devicename) = 'Windows Authentication Server' LAST 1 DAYS",
    "timeout_ms": 60000
  }
}
```

## Security Considerations

- The server uses API tokens for authentication to QRadar
- TLS certificate verification is enabled by default
- Tokens are never logged or exposed in responses
- Input validation is performed using JSON Schema
- Rate limiting helps prevent API abuse

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## License

[MIT](LICENSE)