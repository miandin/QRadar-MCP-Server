/**
 * Utility class for generating QRadar UI deeplinks
 */
export declare class DeeplinkBuilder {
    private baseUrl;
    constructor();
    /**
     * Create a deeplink to the offenses page with optional filter
     */
    offensesPage(filter?: string): string;
    /**
     * Create a deeplink to a specific offense details page
     */
    offenseDetails(offenseId: number): string;
    /**
     * Create a deeplink to the Ariel search page with optional query
     */
    arielSearch(aql?: string): string;
    /**
     * Create a deeplink to the log sources page
     */
    logSourcesPage(): string;
    /**
     * Create a deeplink to a specific log source
     */
    logSourceDetails(logSourceId: number): string;
    /**
     * Create a deeplink to the reference sets page
     */
    referenceSetsPage(): string;
    /**
     * Create a deeplink to a specific reference set
     */
    referenceSetDetails(name: string): string;
    /**
     * Create a deeplink to the saved searches page
     */
    savedSearchesPage(type: 'EVENT' | 'FLOW'): string;
    /**
     * Create a deeplink to the system health page
     */
    systemHealthPage(): string;
}
export declare const deeplinkBuilder: DeeplinkBuilder;
