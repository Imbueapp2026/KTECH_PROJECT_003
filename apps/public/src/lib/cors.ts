/**
 * CORS middleware for API routes
 * Handles Cross-Origin Resource Sharing headers
 */

interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_OPTIONS: CorsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400, // 24 hours
};

function isOriginAllowed(origin: string, allowed: string | string[] | ((origin: string) => boolean)): boolean {
  if (typeof allowed === 'string') {
    return origin === allowed;
  }
  if (Array.isArray(allowed)) {
    return allowed.includes(origin);
  }
  if (typeof allowed === 'function') {
    return allowed(origin);
  }
  return false;
}

export function cors(options: CorsOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const allowedOrigins = opts.origin || '*';

  return (req: Request, response?: Response) => {
    const origin = req.headers.get('origin') || '*';
    
    // Set Access-Control-Allow-Origin
    if (allowedOrigins === '*') {
      if (response) {
        response.headers.set('Access-Control-Allow-Origin', '*');
      }
    } else {
      if (isOriginAllowed(origin, allowedOrigins)) {
        if (response) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        }
      }
    }

    // Set other CORS headers
    if (response) {
      response.headers.set('Access-Control-Allow-Methods', opts.methods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', opts.allowedHeaders?.join(', ') || 'Content-Type, Authorization');
      
      if (opts.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      if (opts.maxAge) {
        response.headers.set('Access-Control-Max-Age', opts.maxAge.toString());
      }
    }

    return response;
  };
}

/**
 * Handle preflight OPTIONS requests
 */
export function handlePreflight(req: Request, options: CorsOptions = {}): Response | null {
  if (req.method === 'OPTIONS') {
    const response = new Response(null, { status: 204 });
    cors(options)(req, response);
    return response;
  }
  return null;
}

/**
 * Wrap a response with CORS headers
 */
export function withCors(response: Response, req: Request, options: CorsOptions = {}): Response {
  cors(options)(req, response);
  return response;
}
