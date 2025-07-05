"use client";

import { useState, useTransition } from 'react';
import type { EndpointConfig } from '@/config/endpoints';
import { checkEndpointStatus, type CustomRequestPayload } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'loading' | 'success' | 'failure';
interface StatusState {
  status: Status;
}

const statusClasses = {
  idle: 'border-border/50 hover:bg-card/80',
  loading: 'border-primary/50 ring-2 ring-primary/50 cursor-not-allowed',
  success: 'border-green-400/50 bg-green-500/10 ring-2 ring-green-400/50',
  failure: 'border-destructive/50 bg-destructive/10 ring-2 ring-destructive/50',
};

const StatusIcon = ({ status }: { status: Status }) => {
  switch (status) {
    case 'loading':
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    case 'failure':
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground/60" />;
  }
};

interface EndpointTableProps {
  endpoints: EndpointConfig[];
  onResponse?: (title: string, message: string) => void;
  useCustomRequest: boolean;
  customRequestConfig: string;
}

function parseCurlCommand(curl: string): CustomRequestPayload | null {
  try {
    let method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
    const headers: Record<string, string> = {};
    let body: Record<string, any> | undefined = undefined;

    // Extract method, e.g., -X POST
    const methodMatch = curl.match(/-X\s+([A-Z]+)/);
    if (methodMatch && methodMatch[1]) {
      const matchedMethod = methodMatch[1].toUpperCase();
      if (['GET', 'POST', 'PUT', 'DELETE'].includes(matchedMethod)) {
        method = matchedMethod as 'GET' | 'POST' | 'PUT' | 'DELETE';
      }
    }

    // Extract headers, e.g., -H 'Header: Value'
    const headerRegex = /-H\s+'([^']+)'/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(curl)) !== null) {
      const headerLine = headerMatch[1];
      const separatorIndex = headerLine.indexOf(':');
      if (separatorIndex > -1) {
        const key = headerLine.substring(0, separatorIndex).trim();
        const value = headerLine.substring(separatorIndex + 1).trim();
        headers[key] = value;
      }
    }

    // Extract body, e.g., -d '{"key": "value"}'
    // This looks for -d or --data followed by a single-quoted string
    const bodyMatch = curl.match(/(?:-d|--data)\s+'([^']*)'/);
    if (bodyMatch && bodyMatch[1]) {
      // Assume body is JSON and parse it
      body = JSON.parse(bodyMatch[1]);
    }

    // If it's a POST/PUT with a body and no Content-Type is set, add it by default.
    if ((method === 'POST' || method === 'PUT') && body && !Object.keys(headers).some(h => h.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = 'application/json';
    }

    return { method, headers, body };
  } catch (error) {
    // This will catch errors from JSON.parse if the body is not valid JSON
    console.error("Failed to parse cURL command:", error);
    return null;
  }
}

export function EndpointTable({ endpoints, onResponse, useCustomRequest, customRequestConfig }: EndpointTableProps) {
  const [statuses, setStatuses] = useState<Record<string, StatusState>>(
    endpoints.reduce((acc, ep) => ({ ...acc, [ep.id]: { status: 'idle' } }), {})
  );
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCheck = (endpoint: EndpointConfig) => {
    if (statuses[endpoint.id].status === 'loading') return;

    let customPayload: CustomRequestPayload | undefined = undefined;
    if (useCustomRequest) {
      if (!customRequestConfig.trim()) {
        toast({
          variant: 'destructive',
          title: 'Custom Request Error',
          description: 'Custom cURL is enabled, but the command is empty.',
        });
        return;
      }
      
      const parsedCurl = parseCurlCommand(customRequestConfig);
      if (!parsedCurl) {
        toast({
          variant: 'destructive',
          title: 'Invalid cURL command',
          description: 'Could not parse the cURL command. Please check the format.',
        });
        return;
      }
      customPayload = parsedCurl;
    }

    setStatuses(prev => ({ ...prev, [endpoint.id]: { status: 'loading' } }));
    startTransition(async () => {
      const result = await checkEndpointStatus(endpoint, customPayload);
      setStatuses(prev => ({ ...prev, [endpoint.id]: { status: result.status } }));
      if (onResponse) {
        onResponse(endpoint.title, result.message);
      }
    });
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {endpoints.map((endpoint) => {
          const currentStatus = statuses[endpoint.id].status;
          return (
            <Tooltip key={endpoint.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleCheck(endpoint)}
                  disabled={currentStatus === 'loading'}
                  className={cn(
                    "p-4 rounded-lg border text-left w-full h-full min-h-[6rem] flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                    statusClasses[currentStatus]
                  )}
                >
                  <div className="flex justify-between items-start w-full">
                      <span className="font-semibold text-sm text-foreground pr-2">{endpoint.title}</span>
                      <StatusIcon status={currentStatus} />
                  </div>
                  <div className="flex flex-col items-start gap-1 mt-2 w-full">
                    <Badge variant="outline" className="text-xs font-mono">{endpoint.method}</Badge>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono">{endpoint.method} {endpoint.url}</p>
                {endpoint.body && <p className="font-mono text-xs text-muted-foreground">{JSON.stringify(endpoint.body)}</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
