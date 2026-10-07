import { eventLog } from "./eventLog";

/** Logs window/tab behavior and uncaught errors; returns a cleanup function. */
export function installActivityMonitor(): () => void {
  const onVisibility = () => eventLog.log("window_visibility", { state: document.visibilityState });
  const onFocus = () => eventLog.log("window_focus");
  const onBlur = () => eventLog.log("window_blur");
  const onPageHide = () => eventLog.log("page_hide");
  const onOnline = () => eventLog.log("network_status", { online: true });
  const onOffline = () => eventLog.log("network_status", { online: false });
  const onError = (e: ErrorEvent) =>
    eventLog.log("unexpected", {
      kind: "uncaught_error",
      message: e.message,
      source: e.filename,
      line: e.lineno,
      column: e.colno,
    });
  const onRejection = (e: PromiseRejectionEvent) =>
    eventLog.log("unexpected", { kind: "unhandled_rejection", reason: String(e.reason) });

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("focus", onFocus);
  window.addEventListener("blur", onBlur);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
