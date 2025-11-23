# QRadar MCP Server - Client Configuration Guide

This guide shows how to configure the QRadar MCP Server in various MCP-compatible clients.

## Prerequisites

1. **Build the MCP server**:
   ```bash
   cd qradar-mcp-server
   npm install
   npm run build
   ```

2. **Configure environment variables** in `.env`:
   ```bash
   cp .env.example .env
   # Edit .env with your QRadar details
   ```

## Configuration for Claude Desktop

Add the following to your Claude Desktop MCP settings file:

**Location**:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration**:
```json
{
  "mcpServers": {
    "qradar": {
      "command": "node",
      "args": [
        "/absolute/path/to/qradar-mcp-server/dist/index.js"
      ],
      "env": {
        "QRADAR_API_BASE_URL": "https://your-qradar.example.com/api",
        "QRADAR_UI_BASE_URL": "https://your-qradar.example.com",
        "QRADAR_API_TOKEN": "your-sec-token-here",
        "QRADAR_AUTH_HEADER": "SEC",
        "QRADAR_API_VERSION": "18.0",
        "QRADAR_TLS_VERIFY": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/qradar-mcp-server` with the actual absolute path to your installation.

### Example (macOS/Linux):
```json
{
  "mcpServers": {
    "qradar": {
      "command": "node",
      "args": [
        "/Users/kashifsalahuddin/QR/qradar-mcp-server/dist/index.js"
      ],
      "env": {
        "QRADAR_API_BASE_URL": "https://qradar.example.com/api",
        "QRADAR_UI_BASE_URL": "https://qradar.example.com",
        "QRADAR_API_TOKEN": "abc123def456",
        "QRADAR_AUTH_HEADER": "SEC",
        "QRADAR_TLS_VERIFY": "false"
      }
    }
  }
}
```

### Example (Windows):
```json
{
  "mcpServers": {
    "qradar": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUser\\QR\\qradar-mcp-server\\dist\\index.js"
      ],
      "env": {
        "QRADAR_API_BASE_URL": "https://qradar.example.com/api",
        "QRADAR_UI_BASE_URL": "https://qradar.example.com",
        "QRADAR_API_TOKEN": "abc123def456",
        "QRADAR_AUTH_HEADER": "SEC",
        "QRADAR_TLS_VERIFY": "false"
      }
    }
  }
}
```

## Configuration for Cline (VS Code Extension)

Add to your Cline MCP settings:

**Location**: VS Code Settings → Extensions → Cline → MCP Settings

```json
{
  "mcpServers": {
    "qradar": {
      "command": "node",
      "args": [
        "/absolute/path/to/qradar-mcp-server/dist/index.js"
      ],
      "env": {
        "QRADAR_API_BASE_URL": "https://your-qradar.example.com/api",
        "QRADAR_UI_BASE_URL": "https://your-qradar.example.com",
        "QRADAR_API_TOKEN": "your-sec-token-here",
        "QRADAR_AUTH_HEADER": "SEC",
        "QRADAR_TLS_VERIFY": "true"
      }
    }
  }
}
```

## Configuration Parameters

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `QRADAR_API_BASE_URL` | QRadar API base URL (with `/api`) | `https://qradar.example.com/api` |
| `QRADAR_UI_BASE_URL` | QRadar UI base URL (without `/api`) | `https://qradar.example.com` |
| `QRADAR_API_TOKEN` | Your QRadar SEC token | `abc123def456...` |

### Optional Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `QRADAR_AUTH_HEADER` | Authentication header name | `SEC` |
| `QRADAR_API_VERSION` | QRadar API version | `18.0` |
| `QRADAR_TLS_VERIFY` | Verify TLS certificates | `true` |
| `QRADAR_CA_PATH` | Path to CA certificate | (none) |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` |

## Getting Your QRadar SEC Token

1. Log into QRadar Console
2. Navigate to **Admin** → **Authorized Services**
3. Click **Create Authorized Service**
4. Configure:
   - **Service Name**: `MCP Server`
   - **Authentication**: `Authorized Service Token`
   - **User Role**: Select appropriate role
5. Click **Create Service**
6. **Copy the SEC token** (you won't see it again!)

## Verifying the Configuration

After adding the configuration:

1. **Restart your MCP client** (Claude Desktop, VS Code, etc.)

2. **Check if tools are available**:
   - In Claude Desktop: Type "What QRadar tools do you have?"
   - In Cline: Check the MCP tools panel

3. **Test a simple query**:
   ```
   List the 5 most recent open offenses in QRadar
   ```

## Troubleshooting

### Server Not Starting

**Check the build**:
```bash
cd qradar-mcp-server
npm run build
ls -la dist/index.js  # Should exist
```

**Test manually**:
```bash
cd qradar-mcp-server
node dist/index.js
```

### Authentication Errors

- ✅ Verify `QRADAR_API_TOKEN` is correct
- ✅ Check token hasn't expired in QRadar Console
- ✅ Ensure `QRADAR_AUTH_HEADER` is set to `SEC`

### Connection Errors

- ✅ Verify `QRADAR_API_BASE_URL` includes `/api`
- ✅ Check network connectivity to QRadar
- ✅ For self-signed certs, set `QRADAR_TLS_VERIFY: "false"`

### Path Issues

- ✅ Use **absolute paths** (not relative like `./` or `~/`)
- ✅ On Windows, use double backslashes: `C:\\Users\\...`
- ✅ Verify the path exists: `ls /path/to/qradar-mcp-server/dist/index.js`

## Alternative: Using NPX

Instead of building locally, you can use npx (if published to npm):

```json
{
  "mcpServers": {
    "qradar": {
      "command": "npx",
      "args": [
        "-y",
        "qradar-mcp-server"
      ],
      "env": {
        "QRADAR_API_BASE_URL": "https://qradar.example.com/api",
        "QRADAR_API_TOKEN": "your-token"
      }
    }
  }
}
```

## Alternative: Using Docker

If you prefer Docker:

```json
{
  "mcpServers": {
    "qradar": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--env-file",
        "/absolute/path/to/qradar-mcp-server/.env",
        "qradar-mcp-server"
      ]
    }
  }
}
```

First build the Docker image:
```bash
cd qradar-mcp-server
docker build -t qradar-mcp-server .
```

## Available Tools

Once configured, you'll have access to these QRadar tools:

1. **list_offenses** - List offenses with filtering
2. **get_offense** - Get offense details by ID
3. **search_ariel** - Execute Ariel queries
4. **list_log_sources** - List log sources
5. **list_reference_sets** - List reference sets
6. **get_reference_set** - Get reference set details
7. **add_reference_set_item** - Add item to reference set
8. **delete_reference_set_item** - Remove item from reference set
9. **list_saved_searches** - List saved searches
10. **run_saved_search** - Execute a saved search
11. **system_health_summary** - Get system health info

## Example Queries

Once configured, try these in your MCP client:

```
"Show me the 10 most recent open offenses"

"Search QRadar for failed login events in the last hour"

"What log sources are configured in QRadar?"

"Add 192.168.1.100 to the Suspicious_IPs reference set"

"Get the health status of my QRadar system"
```

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** for sensitive data
3. **Enable TLS verification** in production (`QRADAR_TLS_VERIFY: "true"`)
4. **Rotate tokens regularly** in QRadar Console
5. **Use least-privilege roles** for the authorized service
6. **Monitor MCP server logs** for suspicious activity

## Support

For issues:
- Check the MCP server logs
- Verify QRadar connectivity: `curl -k https://your-qradar.example.com/api/help/versions`
- Review QRadar API documentation: https://ibmsecuritydocs.github.io/qradar_api_26.0/