# Getting Started with QRadar MCP Server

This guide provides step-by-step instructions for setting up and using the QRadar MCP Server.

## Starting the Server

### Method 1: Local Development

1. **Install dependencies**:
   ```bash
   cd qradar-mcp-server
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your QRadar details:
   ```
   QRADAR_API_BASE_URL=https://your-qradar-instance.example.com/api
   QRADAR_UI_BASE_URL=https://your-qradar-instance.example.com
   QRADAR_API_TOKEN=your-api-token-here
   ```

3. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

   The server will start on port 3000 (or the port specified in your `.env` file).

### Method 2: Using Docker

1. **Configure environment variables** as described above.

2. **Build and start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Check the logs** (optional):
   ```bash
   docker-compose logs -f
   ```

## Verifying the Server is Running

Once started, you can verify the server is running by accessing:

```
http://localhost:3000/mcp
```

This should return a JSON response with server information and available tools.

## Using the MCP Server

### Connecting an MCP Client

To connect an MCP-compatible client (like an AI IDE or agent runtime), use the server URL:

```
http://localhost:3000/mcp
```

### Manual API Testing

You can also test the API endpoints directly using curl or Postman:

#### List Available Tools

```bash
curl http://localhost:3000/mcp
```

#### Get Tool Schema

```bash
curl http://localhost:3000/mcp/tools/list_offenses/schema
```

#### Execute a Tool

```bash
curl -X POST http://localhost:3000/mcp/tools/list_offenses \
  -H "Content-Type: application/json" \
  -d '{"status": "OPEN", "limit": 5}'
```

## Example Use Cases

### 1. List Recent Open Offenses

```json
{
  "tool": "list_offenses",
  "parameters": {
    "status": "OPEN",
    "limit": 10
  }
}
```

Response:
```json
{
  "items": [
    {
      "id": 123,
      "description": "Potential malware infection",
      "status": "OPEN",
      "offense_type": "Source IP",
      "offense_source": "192.168.1.100",
      "magnitude": 5,
      "start_time": 1633046400000,
      "last_updated_time": 1633046700000,
      "event_count": 42,
      "flow_count": 12,
      "assigned_to": "admin",
      "severity": 7
    },
    // More offenses...
  ],
  "next_start": 10,
  "ui_link": "https://your-qradar-instance.example.com/console/qradar/jsp/QRadar.jsp?appName=SEM&pageId=OffenseList"
}
```

### 2. Get Details of a Specific Offense

```json
{
  "tool": "get_offense",
  "parameters": {
    "offense_id": 123
  }
}
```

Response:
```json
{
  "offense": {
    "id": 123,
    "description": "Potential malware infection",
    "status": "OPEN",
    "offense_type": "Source IP",
    "offense_source": "192.168.1.100",
    "magnitude": 5,
    "start_time": 1633046400000,
    "last_updated_time": 1633046700000,
    "event_count": 42,
    "flow_count": 12,
    "assigned_to": "admin",
    "severity": 7,
    "source_network": "192.168.1.0/24",
    "destination_networks": ["10.0.0.0/8"],
    "categories": ["Malware", "Authentication"]
  },
  "related": {
    "events_link": "https://your-qradar-instance.example.com/console/qradar/jsp/QRadar.jsp?appName=Ariel&query=SELECT%20*%20FROM%20events%20WHERE%20inOffense(123)%20ORDER%20BY%20starttime%20DESC",
    "flows_link": "https://your-qradar-instance.example.com/console/qradar/jsp/QRadar.jsp?appName=Ariel&query=SELECT%20*%20FROM%20flows%20WHERE%20inOffense(123)%20ORDER%20BY%20starttime%20DESC"
  },
  "ui_link": "https://your-qradar-instance.example.com/console/qradar/jsp/QRadar.jsp?appName=SEM&pageId=OffenseSummary&summaryId=123"
}
```

### 3. Run an Ariel Search Query

```json
{
  "tool": "search_ariel",
  "parameters": {
    "aql": "SELECT sourceip, destinationip, username FROM events WHERE LOGSOURCENAME(devicename) = 'Windows Authentication Server' LAST 1 DAYS",
    "timeout_ms": 60000
  }
}
```

Response:
```json
{
  "status": "COMPLETED",
  "rows": [
    {
      "sourceip": "192.168.1.100",
      "destinationip": "10.0.0.5",
      "username": "jdoe"
    },
    // More rows...
  ],
  "ui_link": "https://your-qradar-instance.example.com/console/qradar/jsp/QRadar.jsp?appName=Ariel&query=SELECT%20sourceip%2C%20destinationip%2C%20username%20FROM%20events%20WHERE%20LOGSOURCENAME(devicename)%20%3D%20'Windows%20Authentication%20Server'%20LAST%201%20DAYS"
}
```

### 4. List Reference Sets

```json
{
  "tool": "list_reference_sets",
  "parameters": {
    "name_contains": "malware",
    "limit": 5
  }
}
```

Response:
```json
{
  "items": [
    {
      "name": "known_malware_hashes",
      "element_type": "ALNIC",
      "timeout_type": "FIRST_SEEN",
      "time_to_live": "30 days",
      "creation_time": 1633046400000,
      "number_of_elements": 1250
    },
    // More reference sets...
  ],
  "next_start": 5,
  "ui_link": "https://your-qradar-instance.example.com/console/qradar/jsp/QRadar.jsp?appName=ReferenceDataManager"
}
```

### 5. Add an Item to a Reference Set

```json
{
  "tool": "add_reference_set_item",
  "parameters": {
    "name": "known_malware_hashes",
    "value": "44d88612fea8a8f36de82e1278abb02f",
    "source": "threat_intelligence_feed"
  }
}
```

Response:
```json
{
  "added": true,
  "item": {
    "value": "44d88612fea8a8f36de82e1278abb02f",
    "source": "threat_intelligence_feed",
    "first_seen": 1633046400000,
    "last_seen": 1633046400000
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure the server is running
   - Check if the port is correct and not blocked by a firewall

2. **Authentication Errors**:
   - Verify your QRadar API token is correct
   - Check if the token has the necessary permissions

3. **TLS/SSL Errors**:
   - If using self-signed certificates, set `QRADAR_TLS_VERIFY=false` or provide a CA path

4. **Rate Limiting**:
   - The server implements automatic retry with exponential backoff
   - You can adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` in your `.env` file

### Logs

For more detailed logs, set `LOG_LEVEL=debug` in your `.env` file.

## Next Steps

- Explore the API documentation at `/mcp/docs` (if you've enabled the documentation middleware)
- Integrate with your MCP-compatible client
- Customize the server by adding more tools or enhancing existing ones