# QRadar MCP Server - Usage Examples

This document provides practical examples of using the QRadar MCP server tools.

## Example 1: Find Log Sources by Name

**Query**: "Show me QRadar log sources whose name contains 'DNS analyzer' and return their ID, name, and type."

**Using the MCP Tool**:

The `list_log_sources` tool accepts these parameters:
- `name_contains`: Filter by log source name (case-insensitive)
- `type_id`: Filter by log source type ID
- `start`: Starting index for pagination
- `limit`: Maximum number of items to return (default: 50, max: 1000)

**Tool Invocation**:
```json
{
  "tool": "list_log_sources",
  "parameters": {
    "name_contains": "DNS analyzer",
    "limit": 100
  }
}
```

**What Happens Behind the Scenes**:

The tool constructs a QRadar API filter:
```
name ilike '%DNS analyzer%'
```

And calls:
```
GET /api/config/event_sources/log_source_management/log_sources?filter=name ilike '%DNS analyzer%'&limit=100
```

**Expected Response**:
```json
{
  "items": [
    {
      "id": 123,
      "name": "DNS Analyzer - Primary",
      "type_id": 18,
      "type_name": "DNS",
      "protocol_type_id": 0,
      "enabled": true,
      "gateway": false,
      "status": {
        "status": "ACTIVE",
        "last_updated": 1699876543000
      }
    },
    {
      "id": 456,
      "name": "DNS Analyzer - Secondary",
      "type_id": 18,
      "type_name": "DNS",
      "protocol_type_id": 0,
      "enabled": true,
      "gateway": false,
      "status": {
        "status": "ACTIVE",
        "last_updated": 1699876543000
      }
    }
  ],
  "next_start": null,
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=EventViewer&pageId=LogSourceManagement"
}
```

**Extracting Specific Fields**:

To get just ID, name, and type from the results, you would process the response:

```javascript
items.map(source => ({
  id: source.id,
  name: source.name,
  type: source.type_name
}))
```

Result:
```json
[
  {
    "id": 123,
    "name": "DNS Analyzer - Primary",
    "type": "DNS"
  },
  {
    "id": 456,
    "name": "DNS Analyzer - Secondary",
    "type": "DNS"
  }
]
```

---

## Example 2: List Recent Open Offenses

**Query**: "Show me the 10 most recent open offenses"

**Tool Invocation**:
```json
{
  "tool": "list_offenses",
  "parameters": {
    "status": "OPEN",
    "limit": 10,
    "sort": "-start_time"
  }
}
```

**Response Fields**:
- `id`: Offense ID
- `description`: Offense description
- `status`: OPEN, HIDDEN, or CLOSED
- `magnitude`: Severity (1-10)
- `start_time`: When offense started (epoch milliseconds)
- `event_count`: Number of events
- `source_address_ids`: Source IP addresses involved

---

## Example 3: Search for Failed Login Events

**Query**: "Search QRadar for failed login events in the last hour"

**Tool Invocation**:
```json
{
  "tool": "search_ariel",
  "parameters": {
    "aql": "SELECT sourceip, username, eventname FROM events WHERE eventname ILIKE '%failed%login%' LAST 1 HOURS",
    "timeout_ms": 60000
  }
}
```

**Response**:
```json
{
  "search_id": "abc-123-def",
  "status": "COMPLETED",
  "results": [
    {
      "sourceip": "192.168.1.100",
      "username": "jdoe",
      "eventname": "Failed Login Attempt"
    },
    {
      "sourceip": "10.0.0.50",
      "username": "admin",
      "eventname": "Authentication Failed"
    }
  ],
  "record_count": 2,
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=OffenseList"
}
```

---

## Example 4: Get Offense Details

**Query**: "Get details for offense ID 123"

**Tool Invocation**:
```json
{
  "tool": "get_offense",
  "parameters": {
    "offense_id": 123
  }
}
```

**Response**:
```json
{
  "id": 123,
  "description": "Multiple Failed Login Attempts",
  "status": "OPEN",
  "magnitude": 7,
  "credibility": 5,
  "relevance": 5,
  "severity": 8,
  "offense_type": 1,
  "offense_source": "192.168.1.100",
  "start_time": 1699876543000,
  "last_updated_time": 1699880143000,
  "event_count": 42,
  "flow_count": 0,
  "source_address_ids": [1, 2, 3],
  "destination_networks": ["192.168.1.0/24"],
  "categories": ["Authentication", "Policy Violation"],
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=OffenseDetails&offenseId=123"
}
```

---

## Example 5: Add IP to Reference Set

**Query**: "Add 192.168.1.100 to the Suspicious_IPs reference set"

**Tool Invocation**:
```json
{
  "tool": "add_reference_set_item",
  "parameters": {
    "name": "Suspicious_IPs",
    "value": "192.168.1.100"
  }
}
```

**Response**:
```json
{
  "success": true,
  "reference_set": "Suspicious_IPs",
  "value": "192.168.1.100",
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=ReferenceDataManagement"
}
```

---

## Example 6: List Reference Sets

**Query**: "List all reference sets containing 'IP' in their name"

**Tool Invocation**:
```json
{
  "tool": "list_reference_sets",
  "parameters": {
    "name_contains": "IP",
    "limit": 50
  }
}
```

**Response**:
```json
{
  "items": [
    {
      "name": "Suspicious_IPs",
      "element_type": "IP",
      "number_of_elements": 150,
      "creation_time": 1699876543000
    },
    {
      "name": "Whitelisted_IPs",
      "element_type": "IP",
      "number_of_elements": 25,
      "creation_time": 1699876543000
    }
  ],
  "next_start": null,
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=ReferenceDataManagement"
}
```

---

## Example 7: Get System Health

**Query**: "What's the health status of my QRadar system?"

**Tool Invocation**:
```json
{
  "tool": "system_health_summary",
  "parameters": {}
}
```

**Response**:
```json
{
  "system_health": {
    "overall_status": "GREEN",
    "components": [
      {
        "name": "Event Processor",
        "status": "GREEN",
        "message": "Operating normally"
      },
      {
        "name": "Flow Processor",
        "status": "GREEN",
        "message": "Operating normally"
      },
      {
        "name": "Ariel Database",
        "status": "YELLOW",
        "message": "Disk usage at 75%"
      }
    ]
  },
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=SystemHealth"
}
```

---

## Example 8: Run a Saved Search

**Query**: "Run the saved search with ID 42"

**Tool Invocation**:
```json
{
  "tool": "run_saved_search",
  "parameters": {
    "search_id": 42,
    "timeout_ms": 120000
  }
}
```

---

## Example 9: List Saved Searches

**Query**: "List all saved event searches"

**Tool Invocation**:
```json
{
  "tool": "list_saved_searches",
  "parameters": {
    "search_type": "EVENT",
    "limit": 50
  }
}
```

**Response**:
```json
{
  "items": [
    {
      "id": 42,
      "name": "Failed Logins - Last 24h",
      "description": "All failed login attempts in the last 24 hours",
      "aql": "SELECT * FROM events WHERE eventname ILIKE '%failed%login%' LAST 24 HOURS",
      "owner": "admin"
    }
  ],
  "next_start": null,
  "ui_link": "https://your-qradar.example.com/console/qradar/jsp/QRadar.jsp?appName=EventViewer&pageId=SavedSearches"
}
```

---

## Tips for Using the MCP Server

### 1. Case-Insensitive Filtering
The `name_contains` parameter uses SQL `ILIKE`, so it's case-insensitive:
- `"DNS analyzer"` matches `"DNS Analyzer"`, `"dns analyzer"`, `"DNS ANALYZER"`

### 2. Pagination
For large result sets, use pagination:
```json
{
  "tool": "list_log_sources",
  "parameters": {
    "start": 0,
    "limit": 50
  }
}
```

If `next_start` is returned, fetch the next page:
```json
{
  "tool": "list_log_sources",
  "parameters": {
    "start": 50,
    "limit": 50
  }
}
```

### 3. Combining Filters
You can combine multiple filters:
```json
{
  "tool": "list_log_sources",
  "parameters": {
    "name_contains": "DNS",
    "type_id": 18,
    "limit": 100
  }
}
```

This creates: `type_id = 18 AND name ilike '%DNS%'`

### 4. UI Deeplinks
Every response includes a `ui_link` that takes you directly to the relevant QRadar UI page for further investigation.

### 5. Error Handling
If a tool fails, you'll get a structured error:
```json
{
  "error": "QRadarApiError",
  "message": "Unauthorized",
  "status": 401,
  "code": "HTTP_401",
  "hint": "Check your API token"
}
```

---

## Common QRadar AQL Patterns

### Time Ranges
- `LAST 1 HOURS`
- `LAST 24 HOURS`
- `LAST 7 DAYS`
- `START '2024-01-01 00:00' STOP '2024-01-31 23:59'`

### Pattern Matching
- `eventname ILIKE '%failed%'` - Case-insensitive contains
- `sourceip = '192.168.1.100'` - Exact match
- `username IN ('admin', 'root')` - Multiple values

### Aggregation
- `SELECT sourceip, COUNT(*) as count FROM events GROUP BY sourceip`
- `SELECT username, MAX(magnitude) FROM events GROUP BY username`

---

## Troubleshooting

### No Results Returned
- Check your filter syntax
- Verify the log source/offense/reference set exists
- Try without filters first to see all items

### Timeout Errors
- Increase `timeout_ms` for long-running searches
- Narrow your time range in AQL queries
- Use pagination for large result sets

### Authentication Errors
- Verify your SEC token is valid
- Check token permissions in QRadar Console
- Ensure `QRADAR_AUTH_HEADER` is set to `SEC`

---

For more information, see:
- [QRadar API Documentation](https://ibmsecuritydocs.github.io/qradar_api_26.0/)
- [AQL Reference Guide](https://www.ibm.com/docs/en/qradar-common?topic=structure-aql-overview)