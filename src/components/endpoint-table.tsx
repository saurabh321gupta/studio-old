"use client";

import { useState, useTransition } from 'react';
import type { EndpointConfig } from '@/config/endpoints';
import { checkEndpointStatus } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, CheckCircle2, XCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'loading' | 'success' | 'failure';
interface StatusState {
  status: Status;
  message?: string;
}

const StatusIndicator = ({ status, message }: StatusState) => {
  const statusConfig = {
    idle: {
      icon: <Circle className="text-muted-foreground/60" />,
      text: 'Idle',
      color: 'text-muted-foreground/80',
    },
    loading: {
      icon: <Loader2 className="animate-spin text-primary" />,
      text: 'Checking...',
      color: 'text-primary',
    },
    success: {
      icon: <CheckCircle2 className="text-green-400" />,
      text: 'Success',
      color: 'text-green-400',
    },
    failure: {
      icon: <XCircle className="text-destructive" />,
      text: `Failure`,
      color: 'text-destructive',
    },
  };

  const current = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2 font-medium", current.color)}>
      {current.icon}
      <span className="flex-grow">{current.text}</span>
      {status === 'failure' && message && <span className="text-xs font-mono opacity-80 hidden md:inline-block">({message})</span>}
    </div>
  );
};

const MethodBadge = ({ method }: { method: EndpointConfig['method'] }) => {
  const colorMap = {
    GET: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
    POST: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
  };
  return <Badge variant="outline" className={cn("w-[60px] justify-center text-xs font-bold", colorMap[method])}>{method}</Badge>;
}

export function EndpointTable({ endpoints }: { endpoints: EndpointConfig[] }) {
  const [statuses, setStatuses] = useState<Record<string, StatusState>>(
    endpoints.reduce((acc, ep) => ({ ...acc, [ep.id]: { status: 'idle' } }), {})
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCheck = (endpoint: EndpointConfig) => {
    setStatuses(prev => ({ ...prev, [endpoint.id]: { status: 'loading' } }));
    startTransition(async () => {
      const result = await checkEndpointStatus(endpoint);
      setStatuses(prev => ({ ...prev, [endpoint.id]: result }));
      if (result.status === 'failure') {
        toast({
          variant: 'destructive',
          title: `Endpoint Failed: ${endpoint.title}`,
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Endpoint</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints.map((endpoint) => (
            <TableRow key={endpoint.id} className="hover:bg-card/50">
              <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span>{endpoint.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">{endpoint.url}</span>
                </div>
              </TableCell>
              <TableCell>
                <MethodBadge method={endpoint.method} />
              </TableCell>
              <TableCell>
                <StatusIndicator {...statuses[endpoint.id]} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheck(endpoint)}
                  disabled={statuses[endpoint.id].status === 'loading'}
                  className="group"
                >
                  Check
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
