import { Component, useEffect, useRef, type ErrorInfo, type ReactNode } from "react";
import { RoundScreen } from "./ui/screens/RoundScreen";
import { eventLog } from "./logging/eventLog";
import { installActivityMonitor } from "./logging/activityMonitor";

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    eventLog.log("unexpected", {
      kind: "render_error",
      message: error.message,
      componentStack: info.componentStack ?? "",
    });
  }

  render() {
    if (this.state.failed) {
      return (
        <p role="alert">
          Something wobbled! Please reload the page to get back on the rink.
        </p>
      );
    }
    return this.props.children;
  }
}

function exportLog() {
  eventLog.log("log_exported", { eventCount: eventLog.getEvents().length });
  const blob = new Blob([eventLog.toNdjson()], { type: "application/x-ndjson" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wordderby-log-${new Date().toISOString().replace(/[:.]/g, "-")}.ndjson`;
  a.click();
  URL.revokeObjectURL(url);
}

export function App() {
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      eventLog.log("session_start", {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
      });
    }
    return installActivityMonitor();
  }, []);

  return (
    <main className="app">
      <h1>WordDerby</h1>
      <ErrorBoundary>
        <RoundScreen />
      </ErrorBoundary>
      <footer className="app__footer">
        <button type="button" onClick={exportLog}>
          Download event log
        </button>
      </footer>
    </main>
  );
}
