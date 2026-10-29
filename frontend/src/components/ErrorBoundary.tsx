import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render failed", error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-3xl">Something flickered</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't load this page. Please try again.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
