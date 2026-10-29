import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
