import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { appConfig } from './config/index.js';

// QRadar tools + schemas
import {
  listOffenses,
  listOffensesInputSchema,
  listOffensesOutputSchema,
} from './tools/listOffenses.js';

import {
  getOffense,
  getOffenseInputSchema,
  getOffenseOutputSchema,
} from './tools/getOffense.js';

import {
  searchAriel,
  searchArielInputSchema,
  searchArielOutputSchema,
} from './tools/searchAriel.js';

import {
  listLogSources,
  listLogSourcesInputSchema,
  listLogSourcesOutputSchema,
} from './tools/listLogSources.js';

import {
  listReferenceSets,
  listReferenceSetsInputSchema,
  listReferenceSetsOutputSchema,
} from './tools/listReferenceSets.js';

import {
  getReferenceSet,
  getReferenceSetInputSchema,
  getReferenceSetOutputSchema,
} from './tools/getReferenceSet.js';

import {
  addReferenceSetItem,
  addReferenceSetItemInputSchema,
  addReferenceSetItemOutputSchema,
} from './tools/addReferenceSetItem.js';

import {
  deleteReferenceSetItem,
  deleteReferenceSetItemInputSchema,
  deleteReferenceSetItemOutputSchema,
} from './tools/deleteReferenceSetItem.js';

import {
  listSavedSearches,
  listSavedSearchesInputSchema,
  listSavedSearchesOutputSchema,
} from './tools/listSavedSearches.js';

import {
  runSavedSearch,
  runSavedSearchInputSchema,
  runSavedSearchOutputSchema,
} from './tools/runSavedSearch.js';

import {
  systemHealthSummary,
  systemHealthSummaryInputSchema,
  systemHealthSummaryOutputSchema,
} from './tools/systemHealthSummary.js';

async function startServer() {
  try {
    const server = new McpServer({
      name: 'qradar-mcp-server',
      version: '1.0.0',
    });

    //
    // TOOL REGISTRATIONS
    //

    // 1) list_offenses
    server.registerTool(
      'list_offenses',
      {
        title: 'List QRadar offenses',
        description: 'List offenses from QRadar with optional filtering',
        inputSchema: listOffensesInputSchema,
        outputSchema: listOffensesOutputSchema,
      },
      async (args: any, _extra: any) => {
        try {
          const result = await listOffenses({
            limit: args.limit ?? 50,
            status: args.status,
            filter: args.filter,
            start: args.start,
            fields: args.fields,
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
        } catch (error) {
          // Return empty result on error to maintain schema compliance
          const emptyResult = {
            items: [],
            next_start: undefined,
            ui_link: undefined,
          };
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: String(error), result: emptyResult }, null, 2),
              },
            ],
            structuredContent: emptyResult,
          };
        }
      },
    );

    // 2) get_offense
    server.registerTool(
      'get_offense',
      {
        title: 'Get QRadar offense',
        description: 'Get details of a specific offense by ID',
        inputSchema: getOffenseInputSchema,
        outputSchema: getOffenseOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await getOffense({
          offense_id: args.offense_id,
          fields: args.fields,
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

    // 3) search_ariel
    server.registerTool(
      'search_ariel',
      {
        title: 'Search Ariel (QRadar AQL)',
        description: 'Execute an Ariel query against events or flows',
        inputSchema: searchArielInputSchema,
        outputSchema: searchArielOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await searchAriel({
          aql: args.aql,
          timeout_ms: args.timeout_ms ?? 60000,
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

    // 4) list_log_sources
    server.registerTool(
      'list_log_sources',
      {
        title: 'List log sources',
        description: 'List log sources with optional filtering',
        inputSchema: listLogSourcesInputSchema,
        outputSchema: listLogSourcesOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await listLogSources({
          limit: args.limit ?? 50,
          type_id: args.type_id,
          start: args.start,
          name_contains: args.name_contains,
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

    // 5) list_reference_sets
    server.registerTool(
      'list_reference_sets',
      {
        title: 'List reference sets',
        description: 'List reference sets with optional filtering',
        inputSchema: listReferenceSetsInputSchema,
        outputSchema: listReferenceSetsOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await listReferenceSets({
          limit: args.limit ?? 50,
          start: args.start,
          name_contains: args.name_contains,
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

    // 6) get_reference_set
    server.registerTool(
      'get_reference_set',
      {
        title: 'Get reference set',
        description: 'Get a specific reference set by name',
        inputSchema: getReferenceSetInputSchema,
        outputSchema: getReferenceSetOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await getReferenceSet({
          name: args.name,
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

    // 7) add_reference_set_item
    server.registerTool(
      'add_reference_set_item',
      {
        title: 'Add item to reference set',
        description: 'Add an item to a QRadar reference set',
        inputSchema: addReferenceSetItemInputSchema,
        outputSchema: addReferenceSetItemOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await addReferenceSetItem({
          name: args.name,
          value: args.value,
          time_to_live: args.time_to_live,
          source: args.source,
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

    // 8) delete_reference_set_item
    server.registerTool(
      'delete_reference_set_item',
      {
        title: 'Delete item from reference set',
        description: 'Delete an item from a QRadar reference set',
        inputSchema: deleteReferenceSetItemInputSchema,
        outputSchema: deleteReferenceSetItemOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await deleteReferenceSetItem({
          name: args.name,
          value: args.value,
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

    // 9) list_saved_searches
    server.registerTool(
      'list_saved_searches',
      {
        title: 'List saved searches',
        description: 'List saved QRadar searches',
        inputSchema: listSavedSearchesInputSchema,
        outputSchema: listSavedSearchesOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await listSavedSearches({
          type: args.type,
          limit: args.limit ?? 50,
          start: args.start,
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

    // 10) run_saved_search
    server.registerTool(
      'run_saved_search',
      {
        title: 'Run saved search',
        description: 'Run a QRadar saved search by ID',
        inputSchema: runSavedSearchInputSchema,
        outputSchema: runSavedSearchOutputSchema,
      },
      async (args: any, _extra: any) => {
        const result = await runSavedSearch({
          search_id: args.search_id,
          timeout_ms: args.timeout_ms ?? 60000,
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

    // 11) system_health_summary
    server.registerTool(
      'system_health_summary',
      {
        title: 'QRadar system health summary',
        description: 'Get a summary of QRadar system health',
        inputSchema: systemHealthSummaryInputSchema,
        outputSchema: systemHealthSummaryOutputSchema,
      },
      async (_args: any, _extra: any) => {
        const result = await systemHealthSummary({});

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

    // Start the server over stdio (for MCP clients like ChatGPT / Copilot)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // IMPORTANT: do NOT call transport.start() – connect() already starts it.

    console.log(
      `🚀 QRadar MCP Server (stdio) initialised – config host: ${appConfig.HOST}:${appConfig.PORT}`,
    );
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

startServer();

// Made with Bob
