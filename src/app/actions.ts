'use server';

import type { EndpointConfig } from '@/config/endpoints';

export async function checkEndpointStatus(
  endpoint: EndpointConfig
): Promise<{ status: 'success' | 'failure'; message: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

  // Simulate API call and validation logic
  // Make one endpoint always fail for demonstration
  const success = endpoint.id === 'analytics-service-failing' ? false : Math.random() > 0.2; // 80% chance of success

  if (success) {
    return { status: 'success', message: 'OK' };
  } else {
    const errors = [
      'Invalid response format',
      'Server timeout',
      'Unauthorized (401)',
      'Resource not found (404)',
      'Internal Server Error (500)',
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    return { status: 'failure', message: randomError };
  }
}
