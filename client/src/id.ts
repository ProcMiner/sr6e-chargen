// crypto.randomUUID() only exists in a "secure context" (HTTPS, or the
// localhost exemption) - on a plain-HTTP deployment it's simply undefined in
// Firefox and Safari, and every call site that used it to mint a fresh id
// for a new list entry (a knowledge line, a contact, a gear line, an
// advancement log entry, ...) would throw and silently abort the state
// update it was part of. This never showed up in dev testing because
// localhost is always a secure context regardless of protocol. Falls back to
// a non-cryptographic but perfectly adequate unique string - these ids are
// only ever used as React keys and local list identifiers, never anything
// security-sensitive.
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
