const { db } = require("../config/database");

// In-memory rolling store for health and error events (kept small to avoid memory growth)
const MAX_HEALTH_EVENTS = 500;
const MAX_ERROR_EVENTS = 200;

const state = {
  healthEvents: [],
  errorEvents: [],
  lastUp: null,
  lastDown: null,
};

const trimTo = (arr, max) => {
  if (arr.length > max) arr.splice(0, arr.length - max);
};

const logAuditError = async (note) => {
  try {
    await db.query(
      `INSERT INTO salon_audit (salon_id, event_type, event_note, performed_by) VALUES (?, ?, ?, ?)`,
      [null, "ERROR", note?.slice(0, 500) || "Unknown error", null]
    );
  } catch (err) {
    // Keep audit logging best-effort only
    console.error("Failed to write health error to salon_audit:", err.message || err);
  }
};

const recordHealthCheck = async ({ ok, latencyMs, source = "db", error }) => {
  const ts = new Date();
  state.healthEvents.push({
    ts,
    ok,
    latencyMs: latencyMs ?? null,
    source,
    error: error ? error.toString().slice(0, 200) : null,
  });
  trimTo(state.healthEvents, MAX_HEALTH_EVENTS);

  if (ok) state.lastUp = ts;
  else state.lastDown = ts;

  if (!ok) {
    const note = `Health check failed (${source}): ${error?.message || error || "Unknown issue"}`;
    await logAuditError(note);
  }

  return { lastUp: state.lastUp, lastDown: state.lastDown };
};

const checkDatabase = async () => {
  const start = Date.now();
  try {
    await db.query("SELECT 1");
    const latencyMs = Date.now() - start;
    const stamps = await recordHealthCheck({ ok: true, latencyMs });
    return { ok: true, latencyMs, ...stamps };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const stamps = await recordHealthCheck({ ok: false, latencyMs, error });
    return { ok: false, latencyMs: null, error: error?.message || "DB ping failed", ...stamps };
  }
};

const recordAppError = async (err, context = {}) => {
  const ts = new Date();
  const message = err?.message || "Unknown error";
  const meta = [
    context.route ? `route=${context.route}` : null,
    context.method ? `method=${context.method}` : null,
    context.userId ? `user_id=${context.userId}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  state.errorEvents.push({
    ts,
    message,
    meta,
    stack: err?.stack,
  });
  trimTo(state.errorEvents, MAX_ERROR_EVENTS);

  const note = `App error: ${message}${meta ? ` | ${meta}` : ""}`;
  await logAuditError(note);
};

const getUptimePercent = (windowMinutes = 24 * 60) => {
  const since = Date.now() - windowMinutes * 60 * 1000;
  const recent = state.healthEvents.filter((e) => e.ts.getTime() >= since);
  if (recent.length === 0) {
    // If we have ever been up during this process, assume healthy
    return state.lastUp ? 100 : 0;
  }
  const okCount = recent.filter((e) => e.ok).length;
  return Number(((okCount / recent.length) * 100).toFixed(2));
};

const getIncidents = (windowMinutes = 24 * 60) => {
  const since = Date.now() - windowMinutes * 60 * 1000;
  const recent = state.healthEvents.filter((e) => e.ts.getTime() >= since);
  const incidents = [];

  let openIncident = null;
  for (const event of recent) {
    if (!event.ok) {
      if (!openIncident) {
        openIncident = {
          started_at: event.ts,
          last_noted_at: event.ts,
          status: "open",
          summary: `Health check failing (${event.source})`,
          severity: "critical",
        };
      } else {
        openIncident.last_noted_at = event.ts;
      }
    } else if (openIncident) {
      // Resolve the current incident
      openIncident.resolved_at = event.ts;
      openIncident.status = "resolved";
      incidents.push(openIncident);
      openIncident = null;
    }
  }

  if (openIncident) incidents.push(openIncident);
  return incidents;
};

const getRecentErrors = async (limit = 10) => {
  try {
    const [auditRows] = await db.query(
      `SELECT salon_id, event_type, event_note, created_at 
       FROM salon_audit 
       WHERE event_type = 'ERROR'
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );

    const auditErrors = auditRows.map((row) => ({
      id:
        row.created_at && !Number.isNaN(new Date(row.created_at).getTime())
          ? `${row.salon_id || "audit"}-${new Date(row.created_at).getTime()}`
          : `audit-${Math.random().toString(36).slice(2)}`,
      service: row.event_type || "audit",
      message: row.event_note || "Error",
      timestamp: row.created_at,
      severity: "error",
    }));

    const memoryErrors = state.errorEvents
      .slice(-limit)
      .reverse()
      .map((err) => ({
        id: `memory-${err.ts.getTime()}`,
        service: "app",
        message: err.meta ? `${err.message} (${err.meta})` : err.message,
        timestamp: err.ts,
        severity: "error",
      }));

    const combined = [...auditErrors, ...memoryErrors]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return combined;
  } catch (err) {
    console.error("Failed to read audit errors:", err.message || err);
    // Fallback to in-memory errors
    return state.errorEvents.slice(-limit).map((e) => ({
      id: `memory-${e.ts.getTime()}`,
      service: "app",
      message: e.meta ? `${e.message} (${e.meta})` : e.message,
      timestamp: e.ts,
      severity: "error",
    }));
  }
};

const getStateSnapshot = () => ({
  lastUp: state.lastUp,
  lastDown: state.lastDown,
  recentHealth: [...state.healthEvents].slice(-5),
});

module.exports = {
  checkDatabase,
  recordAppError,
  getUptimePercent,
  getIncidents,
  getRecentErrors,
  getStateSnapshot,
};
