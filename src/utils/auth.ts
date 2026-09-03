export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePassword(password: string): string {
  return password.trim();
}

export function clearStaleAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Repli si /me échoue après un login_check réussi. */
export function buildUserFromToken(token: string, emailFallback: string) {
  const payload = parseJwtPayload(token) ?? {};
  const roles = payload.roles;
  return {
    id: Number(payload.id ?? payload.user_id ?? payload.sub ?? 0),
    name: String(payload.name ?? payload.family_name ?? ''),
    firstName: String(payload.firstName ?? payload.given_name ?? ''),
    email: String(payload.username ?? payload.email ?? emailFallback),
    roles: Array.isArray(roles) ? roles : [],
  };
}

export const API_BASE = 'https://backoffice.atelier-de-marie.com/api/';
