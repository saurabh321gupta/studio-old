"use client";

import { useState, useTransition } from 'react';
import type { EndpointConfig } from '@/config/endpoints';
import { checkEndpointStatus } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

type Status = 'idle' | 'loading' | 'success' | 'failure';
interface StatusState {
  status: Status;
  message?: string;
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

export function EndpointTable({ endpoints }: { endpoints: EndpointConfig[] }) {
  const [statuses, setStatuses] = useState<Record<string, StatusState>>(
    endpoints.reduce((acc, ep) => ({ ...acc, [ep.id]: { status: 'idle' } }), {})
  );
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCheck = (endpoint: EndpointConfig) => {
    if (statuses[endpoint.id].status === 'loading') return;

    setStatuses(prev => ({ ...prev, [endpoint.id]: { status: 'loading' } }));
    startTransition(async () => {
      const result = await checkEndpointStatus(endpoint);
      setStatuses(prev => ({ ...prev, [endpoint.id]: result }));
      if (result.status === 'failure' && result.message.length > 100) { // Only toast for long error messages
        toast({
          variant: 'destructive',
          title: `Endpoint Failed: ${endpoint.title}`,
          description: "See details in the response panel.",
        });
      }
    });
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {endpoints.map((endpoint) => {
          const currentStatusState = statuses[endpoint.id];
          const currentStatus = currentStatusState.status;
          return (
            <Tooltip key={endpoint.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleCheck(endpoint)}
                  disabled={currentStatus === 'loading'}
                  className={cn(
                    "p-4 rounded-lg border text-left w-full h-full min-h-[12rem] flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                    statusClasses[currentStatus]
                  )}
                >
                  <div className="flex justify-between items-start w-full">
                      <span className="font-semibold text-sm text-foreground pr-2">{endpoint.title}</span>
                      <StatusIcon status={currentStatus} />
                  </div>
                  <div className="flex flex-col items-start gap-1 mt-2 w-full flex-grow min-h-0">
                    <Badge variant="outline" className="text-xs font-mono">{endpoint.method}</Badge>
                    <div className="text-xs font-code w-full mt-1 flex-grow min-h-0">
                      { (currentStatus === 'success' || currentStatus === 'failure') && currentStatusState.message ? (
                          <ScrollArea className="h-full max-h-28 w-full rounded-md bg-muted/30 p-2">
                              <pre className="text-xs">
                                <code className={cn(
                                    currentStatus === 'success' && 'text-green-400',
                                    currentStatus === 'failure' && 'text-destructive'
                                )}>
                                  {currentStatusState.message}
                                </code>
                              </pre>
                          </ScrollArea>
                        ) : <div className="text-muted-foreground/60 text-xs pt-2">Click to test endpoint...</div>
                      }
                    </div>
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
