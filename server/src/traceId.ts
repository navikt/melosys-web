import { isSpanContextValid, trace } from "@opentelemetry/api";
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Legger traceId fra OpenTelemetry på svaret, så den som feilsøker kan slå
 * opp hele kjeden i Grafana/Tempo og loggene.
 *
 * NAIS autoinstrumentation (nodejs) lager en server-span per innkommende
 * request og kobler `@opentelemetry/api` til den. Uten agenten er API-et en
 * no-op, og vi får ingen gyldig span.
 *
 * Headeren skal ALDRI kunne feile eller stoppe en request. Mangler traceId,
 * eller går noe galt, sendes svaret uendret uten headeren.
 */
export const TRACE_ID_HEADER = "X-Trace-Id";

export type HentTraceId = () => string | undefined;

export const aktivTraceId: HentTraceId = () => {
  const spanContext = trace.getActiveSpan()?.spanContext();
  return spanContext && isSpanContextValid(spanContext) ? spanContext.traceId : undefined;
};

/** `hentTraceId` er en testsøm; produksjonskode skal bruke standardverdien. */
export function traceIdHeader(hentTraceId: HentTraceId = aktivTraceId): RequestHandler {
  return (_request: Request, response: Response, next: NextFunction) => {
    try {
      const traceId = hentTraceId();
      if (traceId && !response.headersSent) {
        response.setHeader(TRACE_ID_HEADER, traceId);
      }
    } catch {
      // Headeren er kun til hjelp ved feilsøking – hopp over.
    }
    next();
  };
}
