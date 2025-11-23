import { config } from 'dotenv';
import { z } from 'zod';
// Load environment variables from .env file
config();
// Define configuration schema with validation
const configSchema = z.object({
    // QRadar API Configuration
    QRADAR_API_BASE_URL: z.string().url(),
    QRADAR_UI_BASE_URL: z.string().url(),
    // Authentication
    QRADAR_API_TOKEN: z.string().min(1),
    QRADAR_AUTH_HEADER: z.string().default('SEC'),
    QRADAR_API_VERSION: z.string().default('18.0'),
    // TLS Configuration
    QRADAR_TLS_VERIFY: z.preprocess((val) => val === 'true' || val === '1', z.boolean().default(true)),
    QRADAR_CA_PATH: z.string().optional(),
    // Server Configuration
    PORT: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive().default(3000)),
    HOST: z.string().default('0.0.0.0'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Rate Limiting
    RATE_LIMIT_MAX: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive().default(100)),
    RATE_LIMIT_WINDOW_MS: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive().default(60000)),
    RETRY_MAX_ATTEMPTS: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive().default(3)),
    RETRY_INITIAL_DELAY_MS: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive().default(1000)),
});
// Parse and validate environment variables
const parseResult = configSchema.safeParse(process.env);
if (!parseResult.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parseResult.error.format());
    process.exit(1);
}
// Export the validated config
export const appConfig = parseResult.data;
// Made with Bob
//# sourceMappingURL=index.js.map