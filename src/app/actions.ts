'use server';

import type { EndpointConfig } from '@/config/endpoints';

export async function checkEndpointStatus(
  endpoint: EndpointConfig
): Promise<{ status: 'success' | 'failure'; message: string }> {
  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...endpoint.headers,
      },
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === endpoint.expectedResponse.status) {
      return { status: 'success', message: `OK (${response.status})` };
    } else {
      return {
        status: 'failure',
        message: `Error: Status ${response.status}`,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return { status: 'failure', message: 'Timeout' };
      }
      // The `cause` property is not standard, so we check for it defensively.
      // In Node.js's fetch, DNS errors often appear here.
      const cause = (error as any).cause;
      if (cause?.code === 'ENOTFOUND') {
        return { status: 'failure', message: 'Host not found' };
      }
      return { status: 'failure', message: error.message };
    }
    return { status: 'failure', message: 'Unknown error' };
  }
}
