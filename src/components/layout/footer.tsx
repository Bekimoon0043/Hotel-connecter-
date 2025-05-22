export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 bg-background">
      <div className="container max-w-7xl text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Hotel Connector. All rights reserved.</p>
        <p className="mt-1">
          Crafted with <span className="text-red-500">❤️</span> for finding your perfect stay.
        </p>
      </div>
    </footer>
  );
}
