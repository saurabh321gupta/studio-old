"use client";

import { useState, useEffect } from 'react';
import { endpoints } from '@/config/endpoints';
import { EndpointTable } from '@/components/endpoint-table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const [lastResponse, setLastResponse] = useState<{ title: string; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleNewResponse = (title: string, message: string) => {
    setLastResponse({ title, message });
  };
  
  useEffect(() => {
    if (!isModalOpen) {
      setProgress(0); // Reset progress on close
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsModalOpen(false); // Auto-close
          return 100;
        }
        return prev + 1; // Increment by 1 every 50ms for a 5s total duration
      });
    }, 50);

    return () => clearInterval(interval); // Cleanup on unmount or when modal is closed
  }, [isModalOpen]);


  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
            Price RT Monitor
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            A real-time monitoring tool to check the health and status of your price endpoints across regions.
          </p>
        </header>
        
        <div className="flex justify-center mb-4">
          <Button onClick={() => setIsModalOpen(true)} disabled={!lastResponse}>
            Show Last Output
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Last Response: {lastResponse?.title}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto rounded-md bg-slate-950">
              <pre className="p-4">
                <code className="text-white">{lastResponse?.message}</code>
              </pre>
            </div>
            <Progress value={progress} className="w-full h-2 mt-4" />
          </DialogContent>
        </Dialog>

        <Card className="border-2 border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Price Endpoint Status</CardTitle>
            <CardDescription>Click a region to validate its price endpoint response in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointTable endpoints={endpoints} onResponse={handleNewResponse} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
