/**
 * QRadar API Types
 */
/**
 * QRadar Offense object
 */
export interface Offense {
    id: number;
    description: string;
    status: 'OPEN' | 'CLOSED' | 'HIDDEN';
    offense_type: string;
    offense_source: string;
    magnitude: number;
    source_count: number;
    event_count: number;
    flow_count: number;
    assigned_to?: string;
    start_time: number;
    last_updated_time: number;
    inactive: boolean;
    protected: boolean;
    closing_user?: string;
    closing_reason_id?: number;
    closing_time?: number;
    follow_up: boolean;
    credibility: number;
    relevance: number;
    severity: number;
    domain_id: number;
    offense_manager_status: string;
    source_network: string;
    destination_networks: string[];
    categories: string[];
    security_category_count: number;
    device_count: number;
    username_count: number;
    [key: string]: any;
}
/**
 * QRadar Log Source object
 */
export interface LogSource {
    id: number;
    name: string;
    type_id: number;
    type_name: string;
    description?: string;
    status: {
        status: string;
        last_updated: number;
    };
    auto_discovered: boolean;
    average_eps?: number;
    enabled: boolean;
    gateway: boolean;
    internal: boolean;
    protocol_type_id: number;
    protocol_parameters: Array<{
        id: number;
        name: string;
        value: string;
    }>;
    [key: string]: any;
}
/**
 * QRadar Reference Set object
 */
export interface ReferenceSet {
    name: string;
    element_type: string;
    timeout_type: string;
    time_to_live?: string;
    creation_time: number;
    number_of_elements: number;
    [key: string]: any;
}
/**
 * QRadar Reference Set Item
 */
export interface ReferenceSetItem {
    value: string | number;
    source?: string;
    first_seen: number;
    last_seen: number;
    [key: string]: any;
}
/**
 * QRadar Saved Search object
 */
export interface SavedSearch {
    id: string;
    name: string;
    query_expression: string;
    database: 'EVENTS' | 'FLOWS';
    is_shared: boolean;
    owner: string;
    created: number;
    modified: number;
    parameters?: Array<{
        name: string;
        value: string;
    }>;
    [key: string]: any;
}
/**
 * QRadar Ariel Search Status
 */
export interface ArielSearchStatus {
    cursor_id?: string;
    status: 'WAIT' | 'EXECUTE' | 'SORTING' | 'COMPLETED' | 'CANCELED' | 'ERROR';
    progress: number;
    completed: boolean;
    record_count?: number;
    save_results?: boolean;
    search_id: string;
    [key: string]: any;
}
/**
 * QRadar System Health Summary
 */
export interface SystemHealthSummary {
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
    [key: string]: any;
}
