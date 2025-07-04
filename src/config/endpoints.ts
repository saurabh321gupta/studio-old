export interface EndpointConfig {
  id: string;
  title: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  expectedResponse: {
    status: number;
  };
}

export const endpoints: EndpointConfig[] = [
  {
    id: 'read-service-stage-east',
    title: 'Read Service - Staging (East)',
    url: 'https://api.example.com/v1/status/east',
    method: 'GET',
    expectedResponse: {
      status: 200,
    },
  },
  {
    id: 'user-auth-prod',
    title: 'User Authentication - Production',
    url: 'https://api.example.com/v1/auth/login',
    method: 'POST',
    body: { user: 'test' },
    expectedResponse: {
      status: 200,
    },
  },
  {
    id: 'data-processing-prod',
    title: 'Data Processing - Production',
    url: 'https://api.example.com/v1/data/process',
    method: 'POST',
    body: { data: 'payload' },
    expectedResponse: {
      status: 202,
    },
  },
  {
    id: 'inventory-update-dev',
    title: 'Inventory Update - Dev',
    url: 'https://dev.api.example.com/v2/inventory/123',
    method: 'PUT',
    body: { stock: 99 },
    expectedResponse: {
      status: 200,
    },
  },
  {
    id: 'delete-user-session-prod',
    title: 'Delete User Session - Production',
    url: 'https://api.example.com/v1/session/xyz',
    method: 'DELETE',
    expectedResponse: {
      status: 204,
    },
  },
    {
    id: 'analytics-service-failing',
    title: 'Analytics Service - Failing',
    url: 'https://api.example.com/v1/analytics/report',
    method: 'GET',
    expectedResponse: {
      status: 200,
    },
  },
];
