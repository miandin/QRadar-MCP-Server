import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
import { SystemHealthSummary } from '../types/qradar.js';

// Input schema for system_health_summary tool
export const systemHealthSummaryInputSchema = z.object({
  // No input parameters required
});

// Output schema for system_health_summary tool
export const systemHealthSummaryOutputSchema = z.object({
  health: z.any().describe('System health information'),
  ui_link: z.string().optional().describe('Link to the system health page in QRadar UI'),
});

// Type definitions for input and output
export type SystemHealthSummaryInput = z.infer<typeof systemHealthSummaryInputSchema>;
export type SystemHealthSummaryOutput = z.infer<typeof systemHealthSummaryOutputSchema>;

/**
 * Get system health summary from QRadar
 */
export async function systemHealthSummary(_input: SystemHealthSummaryInput): Promise<SystemHealthSummaryOutput> {
  try {
    // Make API request for deployment information
    const deployment = await qradarClient.get<SystemHealthSummary['deployment']>('/system/about');
    
    // Make API request for system metrics
    const metrics = await qradarClient.get<SystemHealthSummary['metrics']>('/system/health_metrics');
    
    // Make API request for service status
    const servicesResponse = await qradarClient.get<any>('/system/services');
    
    // Ensure services is an array
    const services = Array.isArray(servicesResponse) ? servicesResponse : [];
    
    // Determine overall status based on services
    let overallStatus: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    
    if (services.length > 0) {
      const stoppedServices = services.filter(service => service.status !== 'RUNNING');
      if (stoppedServices.length > 0) {
        overallStatus = stoppedServices.some(service => service.status === 'ERROR') ? 'RED' : 'YELLOW';
      }
    }
    
    // Combine all data into a health summary
    const healthSummary: SystemHealthSummary = {
      deployment,
      metrics,
      status: {
        overall_status: overallStatus,
        services,
      },
    };

    // Generate UI link
    const uiLink = deeplinkBuilder.systemHealthPage();

    return {
      health: healthSummary,
      ui_link: uiLink,
    };
  } catch (error) {
    console.error('Error getting system health summary:', error);
    throw error;
  }
}

// Made with Bob
