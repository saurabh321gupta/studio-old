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

    const responseText = await response.text();

    if (response.status === endpoint.expectedResponse.status) {
      try {
        const jsonResponse = JSON.parse(responseText);
        return {
          status: 'success',
          message: JSON.stringify(jsonResponse, null, 2),
        };
      } catch (e) {
        return { status: 'success', message: responseText }; // Fallback for non-JSON response
      }
    } else {
      const errorMessage = `Error: Status ${response.status}`;
      return {
        status: 'failure',
        message: responseText ? `${errorMessage}\n\n${responseText}` : errorMessage,
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
