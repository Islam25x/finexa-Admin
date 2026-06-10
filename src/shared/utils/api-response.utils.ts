import { isObject } from "./mapper.utils";

interface EnvelopeCandidate {
  data?: unknown;
  result?: unknown;
  payload?: unknown;
  user?: unknown;
  profile?: unknown;
}

export function unwrapEnvelope(response: unknown): unknown {
  if (!isObject(response)) {
    return response;
  }

  const candidate = response as EnvelopeCandidate;
  return (
    candidate.data ??
    candidate.result ??
    candidate.payload ??
    candidate.user ??
    candidate.profile ??
    response
  );
}
