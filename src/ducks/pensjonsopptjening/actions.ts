import * as Types from "./types";

export function resetPensjonsopptjening() {
  return { type: Types.RESET } as const;
}
