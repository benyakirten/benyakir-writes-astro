export type QueryValue = string | number | readonly (string | number)[];

export function getQueryParams(): URLSearchParams {
  return new URLSearchParams(globalThis.location?.search ?? "");
}

export function serializeToQueryParams(values: readonly (string | number)[]): string {
  return values.map((value) => encodeURIComponent(String(value))).join(",");
}

export function deserializeFromQueryParams(value: string): string[] {
  return decodeURIComponent(value).split(",");
}

export function setOneQueryParam(
  key: string,
  value: QueryValue,
  location = globalThis.location,
  history = globalThis.history,
): void {
  const params = new URLSearchParams(location?.search ?? "");
  params.set(key, Array.isArray(value) ? serializeToQueryParams(value) : String(value));
  if (location && history)
    history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
}

export function setQueryParams(
  values: Record<string, string | number>,
  location = globalThis.location,
  history = globalThis.history,
): void {
  const params = new URLSearchParams(location?.search ?? "");
  for (const [key, value] of Object.entries(values)) params.set(key, String(value));
  if (location && history)
    history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
}

export function removeQueryParam(
  key: string,
  location = globalThis.location,
  history = globalThis.history,
): void {
  const params = new URLSearchParams(location?.search ?? "");
  for (const param of [...params.keys()]) {
    if (param.toLowerCase().startsWith(key.toLowerCase())) params.delete(param);
  }
  if (location && history)
    history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
}

export function parseQueryState(search: string): Map<string, string[]> {
  const state = new Map<string, string[]>();
  for (const [key, value] of new URLSearchParams(search)) {
    state.set(key, value === "" ? [] : deserializeFromQueryParams(value));
  }
  return state;
}

export function getPageNumberFromQuery(params: URLSearchParams): number {
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isNaN(page) || page < 1 ? 0 : page - 1;
}
