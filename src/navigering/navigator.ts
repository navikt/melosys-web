import type { NavigateFunction } from "react-router";

// Gjør routerens navigate tilgjengelig for kode utenfor React-treet, som redux-thunks.
// NavigeringRegistrering setter den når routeren er montert.
let registrertNavigate: NavigateFunction | null = null;

export const registrerNavigate = (navigate: NavigateFunction) => {
  registrertNavigate = navigate;
  return () => {
    if (registrertNavigate === navigate) {
      registrertNavigate = null;
    }
  };
};

export const naviger = (til: string) => {
  if (!registrertNavigate) {
    /* eslint-disable-next-line no-console */
    console.warn(`Kan ikke navigere til "${til}": routeren er ikke montert`);
    return;
  }
  return registrertNavigate(til);
};
