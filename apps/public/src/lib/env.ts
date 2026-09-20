/**
 * Environment variable validation
 * Validates all required environment variables on startup
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  storageUrl?: string;
}

let cachedConfig: EnvConfig | null = null;

export function validateEnv(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;

  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://');
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment variable validation failed:\n${errors.map(e => `- ${e}`).join('\n')}\n\n` +
      'Please check your .env.local file. See DOCS/ENVIRONMENT_VARIABLES.md for guidance.'
    );
  }

  cachedConfig = {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    storageUrl: storageUrl || `${supabaseUrl}/storage/v1/object/public`,
  };

  return cachedConfig;
}

export function getEnv(): EnvConfig {
  if (!cachedConfig) {
    return validateEnv();
  }
  return cachedConfig;
}
