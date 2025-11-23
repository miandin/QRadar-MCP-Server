# QRadar MCP Server Repository Anatomy

This document provides a detailed breakdown of the repository structure, explaining the purpose of each folder and file, as well as organizing the project into epics and user stories.

## Repository Structure

```
qradar-mcp-server/
├── src/                      # Source code directory
│   ├── config/               # Configuration management
│   │   └── index.ts          # Environment variable loading and validation
│   ├── tools/                # MCP tool implementations
│   │   ├── listOffenses.ts   # List offenses tool
│   │   ├── getOffense.ts     # Get offense details tool
│   │   ├── searchAriel.ts    # Execute Ariel search queries tool
│   │   ├── listLogSources.ts # List log sources tool
│   │   ├── listReferenceSets.ts # List reference sets tool
│   │   ├── getReferenceSet.ts # Get reference set details tool
│   │   ├── addReferenceSetItem.ts # Add item to reference set tool
│   │   ├── deleteReferenceSetItem.ts # Delete item from reference set tool
│   │   ├── listSavedSearches.ts # List saved searches tool
│   │   ├── runSavedSearch.ts # Run saved search tool
│   │   └── systemHealthSummary.ts # Get system health summary tool
│   ├── types/                # TypeScript type definitions
│   │   └── qradar.ts         # QRadar API response type definitions
│   ├── utils/                # Utility functions and classes
│   │   ├── qradarClient.ts   # QRadar API client with auth, rate limiting, etc.
│   │   └── deeplinks.ts      # QRadar UI deeplink generation utilities
│   └── index.ts              # Main entry point that sets up the MCP server
├── test/                     # Test files
│   └── integration.test.ts   # Integration tests
├── dist/                     # Compiled JavaScript output (generated)
├── node_modules/             # Node.js dependencies (generated)
├── .env.example              # Example environment variables
├── .env                      # Environment variables (not in repo)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Node.js package definition and scripts
├── package-lock.json         # Locked dependencies (generated)
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Docker Compose configuration
├── README.md                 # Project overview and documentation
├── GETTING_STARTED.md        # Detailed setup and usage instructions
└── REPOSITORY_ANATOMY.md     # This file
```

## File and Directory Purposes

### Root Directory

- **package.json**: Defines project metadata, dependencies, and scripts for building, testing, and running the server
- **tsconfig.json**: TypeScript compiler configuration
- **.env.example**: Template for environment variables needed by the application
- **Dockerfile**: Instructions for building a Docker container for the application
- **docker-compose.yml**: Configuration for running the application with Docker Compose
- **README.md**: Project overview, features, and basic setup instructions
- **GETTING_STARTED.md**: Detailed instructions for setting up and using the server

### src/ Directory

The source code directory contains all TypeScript code organized into subdirectories:

#### src/config/

- **index.ts**: Loads environment variables from .env file, validates them using Zod schema, and exports a typed configuration object

#### src/tools/

Contains implementations of all MCP tools that expose QRadar functionality:

- **listOffenses.ts**: Tool for listing offenses with filtering and pagination
- **getOffense.ts**: Tool for retrieving details of a specific offense
- **searchAriel.ts**: Tool for executing AQL queries against events or flows
- **listLogSources.ts**: Tool for listing log sources with filtering
- **listReferenceSets.ts**: Tool for listing reference sets
- **getReferenceSet.ts**: Tool for retrieving items in a specific reference set
- **addReferenceSetItem.ts**: Tool for adding items to reference sets
- **deleteReferenceSetItem.ts**: Tool for removing items from reference sets
- **listSavedSearches.ts**: Tool for listing saved searches
- **runSavedSearch.ts**: Tool for executing saved searches
- **systemHealthSummary.ts**: Tool for retrieving system health information

Each tool file defines:
- Input schema (using Zod)
- Output schema (using Zod)
- TypeScript types for input and output
- Implementation function that calls QRadar API

#### src/types/

- **qradar.ts**: TypeScript interfaces for QRadar API responses (Offense, LogSource, ReferenceSet, etc.)

#### src/utils/

- **qradarClient.ts**: HTTP client for QRadar API with authentication, rate limiting, retry logic, and error handling
- **deeplinks.ts**: Utility for generating links to the QRadar UI for various resources

#### src/index.ts

Main entry point that:
- Creates the MCP server
- Registers all tools
- Starts the server

### test/ Directory

- **integration.test.ts**: Integration tests for the MCP server and tools

## Epics and User Stories

### Epic 1: Core Infrastructure

**Description**: Set up the foundational infrastructure for the MCP server to connect to QRadar APIs.

**User Stories**:

1. As a developer, I want to initialize a TypeScript project with proper configuration so that I can build a type-safe application.
   - Set up package.json with dependencies
   - Configure TypeScript compiler options
   - Create project directory structure

2. As a developer, I want to create a configuration system that loads from environment variables so that the server can be configured without code changes.
   - Implement environment variable loading
   - Add validation for required variables
   - Provide sensible defaults where appropriate

3. As a developer, I want to create a QRadar API client with authentication so that the server can securely communicate with QRadar.
   - Implement authentication header injection
   - Handle API errors consistently
   - Add request/response logging

4. As a developer, I want to implement rate limiting and retry logic so that the server can handle API throttling gracefully.
   - Add exponential backoff for retries
   - Implement configurable rate limits
   - Handle 429 (Too Many Requests) responses

5. As a developer, I want to create a basic MCP server that can register and execute tools so that clients can discover and use QRadar functionality.
   - Set up MCP server with metadata
   - Create tool registration mechanism
   - Implement tool execution flow

### Epic 2: Security Event Management Tools

**Description**: Implement MCP tools for working with QRadar security events and offenses.

**User Stories**:

1. As a security analyst, I want to list offenses with filtering options so that I can find relevant security incidents.
   - Implement list_offenses tool with filtering
   - Add pagination support
   - Include UI deeplinks to offense list

2. As a security analyst, I want to view detailed information about a specific offense so that I can investigate it thoroughly.
   - Implement get_offense tool
   - Include related events and flows links
   - Add UI deeplink to offense details page

3. As a security analyst, I want to execute Ariel queries against events and flows so that I can search for specific security data.
   - Implement search_ariel tool
   - Handle asynchronous search execution
   - Add timeout and polling mechanism
   - Include UI deeplink to search results

### Epic 3: Log Source Management Tools

**Description**: Implement MCP tools for working with QRadar log sources.

**User Stories**:

1. As a security engineer, I want to list log sources with filtering options so that I can manage data collection points.
   - Implement list_log_sources tool
   - Add filtering by type and name
   - Include UI deeplink to log sources page

### Epic 4: Reference Data Management Tools

**Description**: Implement MCP tools for working with QRadar reference sets.

**User Stories**:

1. As a security engineer, I want to list reference sets so that I can see what reference data is available.
   - Implement list_reference_sets tool
   - Add name filtering
   - Include UI deeplink to reference sets page

2. As a security engineer, I want to view the contents of a reference set so that I can see what values it contains.
   - Implement get_reference_set tool
   - Include UI deeplink to reference set details

3. As a security engineer, I want to add items to reference sets so that I can update threat intelligence data.
   - Implement add_reference_set_item tool
   - Support source attribution
   - Support time-to-live settings

4. As a security engineer, I want to remove items from reference sets so that I can maintain accurate threat intelligence data.
   - Implement delete_reference_set_item tool

### Epic 5: Search Management Tools

**Description**: Implement MCP tools for working with QRadar saved searches.

**User Stories**:

1. As a security analyst, I want to list saved searches so that I can find relevant pre-defined queries.
   - Implement list_saved_searches tool
   - Filter by search type (EVENT or FLOW)
   - Include UI deeplink to saved searches page

2. As a security analyst, I want to execute saved searches so that I can quickly run common queries.
   - Implement run_saved_search tool
   - Handle asynchronous execution
   - Include UI deeplink to search results

### Epic 6: System Management Tools

**Description**: Implement MCP tools for monitoring QRadar system health.

**User Stories**:

1. As a system administrator, I want to view system health information so that I can monitor the QRadar deployment.
   - Implement system_health_summary tool
   - Include deployment information
   - Include system metrics
   - Include service status
   - Add UI deeplink to system monitor page

### Epic 7: Deployment and Documentation

**Description**: Create deployment options and comprehensive documentation.

**User Stories**:

1. As a DevOps engineer, I want to containerize the application so that it can be deployed consistently.
   - Create Dockerfile
   - Create docker-compose.yml
   - Configure environment variable passing

2. As a developer, I want comprehensive documentation so that I can understand how to use and extend the server.
   - Create README with overview
   - Create detailed getting started guide
   - Document repository structure
   - Document API endpoints

3. As a QA engineer, I want integration tests so that I can verify the server works correctly.
   - Create test suite for server endpoints
   - Test authentication failure scenarios
   - Test tool schema validation