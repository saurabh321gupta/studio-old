import { endpoints } from '@/config/endpoints';
import { EndpointTable } from '@/components/endpoint-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
            Price RT Monitor
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            A real-time monitoring tool to check the health and status of your price endpoints across regions.
          </p>
        </header>
        <Card className="border-2 border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Price Endpoint Status</CardTitle>
            <CardDescription>Click an app to validate its price endpoint response in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointTable endpoints={endpoints} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
