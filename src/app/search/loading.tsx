export default function Loading() {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-10 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-1/4 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-card p-6 rounded-lg shadow-lg animate-pulse">
              <div className="h-8 bg-muted rounded mb-6"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-6 bg-muted rounded mb-3 w-1/2"></div>
                  <div className="h-10 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
              <div className="h-12 bg-primary/50 rounded mt-4"></div>
            </div>
          </aside>
          <main className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                    <div className="h-10 bg-primary/50 rounded w-1/2 ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
