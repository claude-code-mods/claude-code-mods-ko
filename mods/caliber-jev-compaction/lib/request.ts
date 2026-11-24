import type { JevAnswer, JevQuestions, JevResponse, JevState } from './types.js';

export const SYSTEM_ONE_URL = 'https://api.typesafe.ai/v1/systemone';
export const DEFAULT_MODEL = 'jev-latest';

export interface JevRequest {
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: string;
}

/** The HTTP request for one Jev call, for any fetch-like transport. */
export function buildJevRequest(
  params: {
    apiKey: string;
    model?: string;
    baseUrl?: string;
  },
  state: JevState,
  questions: JevQuestions,
): JevRequest {
  return {
    url: params.baseUrl ?? SYSTEM_ONE_URL,
    method: 'POST',
    headers: {
      authorization: `Bearer ${params.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model ?? DEFAULT_MODEL,
      state,
      questions,
    }),
  };
}

/** Validates a Jev response body; throws on anything but an `answers` object. */
export function parseJevResponse(
  status: number,
  ok: boolean,
  text: string,
): JevResponse {
  if (!ok) {
    throw new Error(`Jev 요청 실패 (${status}): ${text.slice(0, 200)}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Jev가 잘못된 JSON을 반환했습니다');
  }
  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    !('answers' in parsed) ||
    parsed.answers === null ||
    typeof parsed.answers !== 'object'
  ) {
    throw new Error('Jev 응답에 answers가 없습니다');
  }
  return parsed as JevResponse;
}

/** The `noul` probability of one answer; throws when it is not there. */
export function noulAnswer(
  answers: Record<string, JevAnswer>,
  name: string,
): number {
  const answer = answers[name];
  if (
    !answer ||
    !('noul' in answer) ||
    typeof answer.noul !== 'number' ||
    !Number.isFinite(answer.noul)
  ) {
    throw new Error(`${name}에 대한 Jev 응답이 유효하지 않습니다`);
  }
  return answer.noul;
}
