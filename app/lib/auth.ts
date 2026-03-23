export const ACCESS_TOKEN_KEY = "ccf_access_token";

export type AuthUserDisplay = {
  name: string;
  initials: string;
};

export type AuthUserSource = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

const FALLBACK_USER_DISPLAY: AuthUserDisplay = {
  name: "Usuário",
  initials: "US",
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function toInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  const first = parts[0] ?? "";
  return first.slice(0, 2).toUpperCase() || FALLBACK_USER_DISPLAY.initials;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const tokenParts = token.split(".");
  const payloadSegment = tokenParts[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(paddedBase64);
    const parsed = JSON.parse(decoded);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getUserDisplayFromToken(token: string | null): AuthUserDisplay {
  if (!token) {
    return FALLBACK_USER_DISPLAY;
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return FALLBACK_USER_DISPLAY;
  }

  const preferredName =
    asNonEmptyString(payload.name) ||
    asNonEmptyString(payload.fullName) ||
    asNonEmptyString(payload.username) ||
    asNonEmptyString(payload.preferred_username);

  if (preferredName) {
    return {
      name: preferredName,
      initials: toInitials(preferredName),
    };
  }

  const roleCandidate = asNonEmptyString(payload.role);
  if (roleCandidate && roleCandidate.toLowerCase().includes("admin")) {
    return {
      name: "Admin",
      initials: "AD",
    };
  }

  return FALLBACK_USER_DISPLAY;
}

export function getUserDisplayFromSource(
  source: AuthUserSource | null | undefined,
  tokenFallback: string | null,
): AuthUserDisplay {
  const preferredName = asNonEmptyString(source?.name);

  if (preferredName) {
    return {
      name: preferredName,
      initials: toInitials(preferredName),
    };
  }

  const roleCandidate = asNonEmptyString(source?.role);
  if (roleCandidate && roleCandidate.toLowerCase().includes("admin")) {
    return {
      name: "Admin",
      initials: "AD",
    };
  }

  return getUserDisplayFromToken(tokenFallback);
}
