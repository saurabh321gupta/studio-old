'use server';

import type { EndpointConfig } from '@/config/endpoints';

export type CustomRequestPayload = {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
};

export async function checkEndpointStatus(
  endpoint: EndpointConfig,
  customPayload?: CustomRequestPayload
): Promise<{ status: 'success' | 'failure'; message: string }> {
  try {
    const isCustom = customPayload !== undefined;

    const url = isCustom ? customPayload.url || endpoint.url : endpoint.url;
    const method = isCustom ? customPayload.method || 'GET' : endpoint.method;
    const headers = {
      'Content-Type': 'application/json',
      ...(isCustom ? customPayload.headers : endpoint.headers),
    };
    const body = isCustom ? customPayload.body : endpoint.body;

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
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
