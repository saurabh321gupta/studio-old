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

const regions = [
    'east', 'south', 'west', 'north', 'central', 
    'northeast', 'northwest', 'southeast', 'southwest', 'midwest'
];

export const endpoints: EndpointConfig[] = regions.map(region => ({
    id: `read-prod-${region}`,
    title: `Read Prod ${region.charAt(0).toUpperCase() + region.slice(1)}`,
    url: `https://api.${region}.example.com/v1/price`,
    method: 'POST',
    body: { request: 'price-check' },
    expectedResponse: {
      status: 200,
    },
}));
