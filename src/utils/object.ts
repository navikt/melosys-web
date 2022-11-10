import { isEmpty } from "lodash";

/*
Returnerer true også dersom element er objekt med nested, tomme, felt. Se tester for detaljer.
 */
export const isDeepEmpty = (element: any): boolean => {
  if (isEmpty(element)) return true;
  return isEmpty(
    Object.entries(element)
      .map(([, value]) => {
        if (isEmpty(value)) return true;
        if (value instanceof Object) return isDeepEmpty(value);
        return false;
      })
      .filter((b) => !b)
  );
};
