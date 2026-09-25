import http from "node:http";

export interface TestResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
}

/**
 * Enkel http-klient for tester, uten avhengighet til supertest e.l.
 */
export function request(baseUrl: string, path: string, options: RequestOptions = {}): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const requestOptions: http.RequestOptions = {
      method: options.method ?? "GET",
      headers: options.headers,
    };

    const clientRequest = http.request(url, requestOptions, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        resolve({
          status: response.statusCode ?? 0,
          headers: response.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });

    clientRequest.on("error", reject);

    if (options.body !== undefined) {
      clientRequest.end(options.body);
    } else {
      clientRequest.end();
    }
  });
}

/** Sender en request med kroppen som chunked transfer-encoding (ikke Content-Length). */
export function requestChunked(baseUrl: string, path: string, body: Buffer): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const clientRequest = http.request(
      url,
      { method: "POST", headers: { "Transfer-Encoding": "chunked" } },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    clientRequest.on("error", reject);
    clientRequest.write(body);
    clientRequest.end();
  });
}
