import { ErrorResponse } from "melosys-api";

class ApiError extends Error {
  response: Response;
  body: ErrorResponse;
  status: number;

  constructor(message: string | undefined, response: Response, body: ErrorResponse, status: number) {
    super(message);
    this.response = response;
    this.body = body;
    this.status = status;
  }
}

function isApiError(error: any): error is ApiError {
  return typeof error.status === "number";
}

const sjekkStatuskode = async (response: Response) => {
  if (response.status >= 200 && response.status < 300 && response.ok && !response.redirected) {
    return response;
  }
  throw new ApiError(response.statusText || response.type, response, await response.json(), response.status);
};

export default sjekkStatuskode;
export { isApiError };
