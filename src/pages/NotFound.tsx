import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-primary">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-semibold">Page not found</h1>
        <p className="mb-6 text-muted-foreground max-w-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/dashboard" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
