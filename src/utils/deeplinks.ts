import { appConfig } from '../config/index.js';

/**
 * Utility class for generating QRadar UI deeplinks
 */
export class DeeplinkBuilder {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.QRADAR_UI_BASE_URL;
  }

  /**
   * Create a deeplink to the offenses page with optional filter
   */
  offensesPage(filter?: string): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'SEM');
    url.searchParams.append('pageId', 'OffenseList');
    
    if (filter) {
      url.searchParams.append('filter', filter);
    }
    
    return url.toString();
  }

  /**
   * Create a deeplink to a specific offense details page
   */
  offenseDetails(offenseId: number): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'SEM');
    url.searchParams.append('pageId', 'OffenseSummary');
    url.searchParams.append('summaryId', offenseId.toString());
    
    return url.toString();
  }

  /**
   * Create a deeplink to the Ariel search page with optional query
   */
  arielSearch(aql?: string): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'Ariel');
    
    if (aql) {
      url.searchParams.append('query', encodeURIComponent(aql));
    }
    
    return url.toString();
  }

  /**
   * Create a deeplink to the log sources page
   */
  logSourcesPage(): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'LogSourceManagement');
    
    return url.toString();
  }

  /**
   * Create a deeplink to a specific log source
   */
  logSourceDetails(logSourceId: number): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'LogSourceManagement');
    url.searchParams.append('logSourceId', logSourceId.toString());
    
    return url.toString();
  }

  /**
   * Create a deeplink to the reference sets page
   */
  referenceSetsPage(): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'ReferenceDataManager');
    
    return url.toString();
  }

  /**
   * Create a deeplink to a specific reference set
   */
  referenceSetDetails(name: string): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'ReferenceDataManager');
    url.searchParams.append('referenceSetName', encodeURIComponent(name));
    
    return url.toString();
  }

  /**
   * Create a deeplink to the saved searches page
   */
  savedSearchesPage(type: 'EVENT' | 'FLOW'): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'Ariel');
    url.searchParams.append('pageId', 'SavedSearches');
    url.searchParams.append('dataType', type);
    
    return url.toString();
  }

  /**
   * Create a deeplink to the system health page
   */
  systemHealthPage(): string {
    const url = new URL('/console/qradar/jsp/QRadar.jsp', this.baseUrl);
    url.searchParams.append('appName', 'SystemMonitor');
    
    return url.toString();
  }
}

// Export singleton instance
export const deeplinkBuilder = new DeeplinkBuilder();

// Made with Bob
