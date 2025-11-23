# Quick MCP Configuration Reference

## For Claude Desktop

**Config File Location**:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Add this to your config**:

```json
{
  "mcpServers": {
    "qradar": {
      "command": "node",
      "args": [
        "/Users/kashifsalahuddin/QR/qradar-mcp-server/dist/index.js"
      ],
      "env": {
        "QRADAR_API_BASE_URL": "https://YOUR-QRADAR-HOST/api",
        "QRADAR_UI_BASE_URL": "https://YOUR-QRADAR-HOST",
        "QRADAR_API_TOKEN": "YOUR-SEC-TOKEN",
        "QRADAR_AUTH_HEADER": "SEC",
        "QRADAR_TLS_VERIFY": "false"
      }
    }
  }
}
```

**Replace**:
- `YOUR-QRADAR-HOST` with your QRadar hostname
- `YOUR-SEC-TOKEN` with your actual SEC token
- Set `QRADAR_TLS_VERIFY` to `"true"` for production

---

## For Cline (VS Code)

**Location**: VS Code Settings → Extensions → Cline → Edit MCP Settings

**Add the same JSON** as above.

---

## Before You Start

1. **Build the server**:
   ```bash
   cd /Users/kashifsalahuddin/QR/qradar-mcp-server
   npm install
   npm run build
   ```

2. **Verify build succeeded**:
   ```bash
   ls -la dist/index.js
   ```

3. **Get your SEC token** from QRadar:
   - Admin → Authorized Services → Create Authorized Service

4. **Add config** to your MCP client

5. **Restart** Claude Desktop or VS Code

6. **Test**: Ask "What QRadar tools are available?"

---

## Minimal Working Example

```json
{
  "mcpServers": {
    "qradar": {
      "command": "node",
      "args": ["/Users/kashifsalahuddin/QR/qradar-mcp-server/dist/index.js"],
      "env": {
        "QRADAR_API_BASE_URL": "https://qradar.example.com/api",
        "QRADAR_API_TOKEN": "abc123",
        "QRADAR_UI_BASE_URL": "https://qradar.example.com",
        "QRADAR_TLS_VERIFY": "false"
      }
    }
  }
}
```

---

## Troubleshooting

**Server won't start?**
```bash
# Test manually
cd /Users/kashifsalahuddin/QR/qradar-mcp-server
node dist/index.js
```

**Can't find config file?**
```bash
# macOS
open ~/Library/Application\ Support/Claude/
```

**Need to see logs?**
- Add `"LOG_LEVEL": "debug"` to env

---

See `MCP_CLIENT_CONFIGURATION.md` for full documentation.