import { useParams } from "react-router";

// For sider der rutedefinisjonen garanterer at parameterne finnes (f.eks. ":saksnr").
export function useRuteParams<T extends { [K in keyof T]: string }>(): T {
  return useParams<string>() as T;
}
