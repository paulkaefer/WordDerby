// Append-only, hash-chained event log. Entries are deep-frozen and there is no
// API to edit or delete them; the chain makes out-of-band tampering detectable.

export type LogEventType =
  | "session_start"
  | "round_start"
  | "round_resumed"
  | "round_abandoned"
  | "solve_used"
  | "guess"
  | "word_completed"
  | "round_end"
  | "categories_changed"
  | "log_exported"
  | "window_visibility"
  | "window_focus"
  | "window_blur"
  | "page_hide"
  | "network_status"
  | "unexpected";

export interface LogEvent {
  readonly seq: number;
  /** ISO 8601, UTC. */
  readonly timestamp: string;
  readonly sessionId: string;
  readonly type: LogEventType;
  readonly data: Readonly<Record<string, unknown>>;
  readonly prevHash: string;
  readonly hash: string;
}

export interface LogStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = "wordderby.eventlog";
const GENESIS = "0".repeat(14);

/** cyrb53: fast non-cryptographic hash; detects accidental/casual tampering only. */
function hashString(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}

function computeHash(e: Omit<LogEvent, "hash">): string {
  return hashString(
    [e.seq, e.timestamp, e.sessionId, e.type, JSON.stringify(e.data), e.prevHash].join("|"),
  );
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
  }
  return value;
}

/** Returns the index of the first invalid entry, or -1 if the chain is intact. */
export function verifyLog(events: readonly LogEvent[]): number {
  let prev = GENESIS;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.seq !== i || e.prevHash !== prev || e.hash !== computeHash(e)) return i;
    if (Number.isNaN(Date.parse(e.timestamp))) return i;
    prev = e.hash;
  }
  return -1;
}

function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface EventLog {
  readonly sessionId: string;
  log(type: LogEventType, data?: Record<string, unknown>): void;
  /** Frozen snapshot; mutating it is impossible. */
  getEvents(): readonly LogEvent[];
  toNdjson(): string;
}

export function createEventLog(
  storage: LogStorage | null,
  now: () => Date = () => new Date(),
): EventLog {
  const sessionId = newSessionId();
  let events: LogEvent[] = [];
  let storageFailed = false;

  const append = (type: LogEventType, data: Record<string, unknown>) => {
    const prev = events[events.length - 1];
    const base = {
      seq: events.length,
      timestamp: now().toISOString(),
      sessionId,
      type,
      data: deepFreeze(JSON.parse(JSON.stringify(data)) as Record<string, unknown>),
      prevHash: prev ? prev.hash : GENESIS,
    };
    const entry: LogEvent = deepFreeze({ ...base, hash: computeHash(base) });
    events = [...events, entry];

    if (!storage || storageFailed) return;
    try {
      const existing = storage.getItem(STORAGE_KEY) ?? "";
      storage.setItem(STORAGE_KEY, existing + JSON.stringify(entry) + "\n");
    } catch {
      storageFailed = true;
      append("unexpected", { kind: "log_persist_failed" });
    }
  };

  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY) ?? "";
      const loaded = raw
        .split("\n")
        .filter(Boolean)
        .map((line) => deepFreeze(JSON.parse(line) as LogEvent));
      events = loaded;
      const bad = verifyLog(events);
      if (bad !== -1) {
        append("unexpected", { kind: "log_integrity_failure", firstBadSeq: bad });
      }
    } catch {
      // Unreadable history: keep it untouched in storage, continue in-memory.
      storageFailed = true;
      append("unexpected", { kind: "log_load_failed" });
    }
  }

  return {
    sessionId,
    log: (type, data = {}) => append(type, data),
    getEvents: () => events,
    toNdjson: () => events.map((e) => JSON.stringify(e)).join("\n") + "\n",
  };
}

function defaultStorage(): LogStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export const eventLog: EventLog = createEventLog(defaultStorage());
