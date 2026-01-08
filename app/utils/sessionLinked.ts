export type PreLinkSession = { gebruikerid: number };
export type LinkedSession = { gebruikerid: number; dementgebruikerid: number };

export function singleParam(params: any, key: string) {
  const v = params?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export function numParam(params: any, key: string) {
  const raw = singleParam(params, key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : NaN;
}

export function readPreLinkSession(params: any): PreLinkSession | null {
  const gebruikerid = numParam(params, "gebruikerid") || numParam(params, "gebruikerId");
  if (!Number.isFinite(gebruikerid)) return null;
  return { gebruikerid };
}

export function readLinkedSession(params: any): LinkedSession | null {
  const gebruikerid = numParam(params, "gebruikerid") || numParam(params, "gebruikerId");
  const dementgebruikerid =
    numParam(params, "dementgebruikerid") || numParam(params, "dementgebruikerId");

  if (!Number.isFinite(gebruikerid) || !Number.isFinite(dementgebruikerid)) return null;
  return { gebruikerid, dementgebruikerid };
}

export function replaceWithPreLinkSession(
  router: any,
  pathname: string,
  session: PreLinkSession
) {
  router.replace({ pathname, params: { gebruikerid: String(session.gebruikerid) } } as any);
}

export function replaceWithLinkedSession(
  router: any,
  pathname: string,
  session: LinkedSession
) {
  router.replace({
    pathname,
    params: {
      gebruikerid: String(session.gebruikerid),
      dementgebruikerid: String(session.dementgebruikerid),
    },
  } as any);
}
