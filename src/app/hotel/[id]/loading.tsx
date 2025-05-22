import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="py-8 md:py-12 bg-muted/40 animate-pulse">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery Skeleton */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden shadow-xl">
            <Skeleton className="md:col-span-2 h-[300px] md:h-[500px]" />
            <Skeleton className="h-[200px] md:h-[246px]" />
            <Skeleton className="h-[200px] md:h-[246px]" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <main className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-3/4 mb-3" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/4" />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-5/6" />
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
               <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
              <CardContent className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-48 h-32 rounded-md flex-shrink-0" />
                    <div className="flex-grow space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-6 w-1/4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </main>

          {/* Booking Section Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <Card className="shadow-xl">
              <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-4">
                <Skeleton className="h-8 w-1/2 self-center" />
                <Skeleton className="h-12 w-full" />
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
