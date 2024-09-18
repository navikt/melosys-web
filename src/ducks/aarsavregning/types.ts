export const OK = "aarsavregning/OK";
export const RESET = "aarsavregning/RESET";

interface OkAction {
  type: typeof OK;
  data: any;
}

interface ResetAction {
  type: typeof RESET;
}

export type Action = OkAction | ResetAction;
