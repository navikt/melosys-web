import { parsePath, UNSAFE_createBrowserHistory as createBrowserHistory } from "react-router";
import type { To } from "react-router";

type Historikk = ReturnType<typeof createBrowserHistory>;

/**
 * React Router 8 gjør rotstien "/" om til basename uten avsluttende skråstrek (`/melosys`),
 * mens Router 5 ga `/melosys/`. Legger skråstreken tilbake når appen selv navigerer eller lager
 * lenker til forsiden, slik at URL-en er som før. Direkte åpning av `/melosys` påvirkes ikke.
 */
export const medSkraastrekPaaRot = (historikk: Historikk, basename: string): Historikk => {
  const rot = basename.replace(/\/+$/, "");

  const leggTilSkraastrek = (to: To): To => {
    const sti = typeof to === "string" ? parsePath(to) : to;
    return rot && sti.pathname === rot ? { ...sti, pathname: `${rot}/` } : to;
  };

  return {
    get action() {
      return historikk.action;
    },
    get location() {
      return historikk.location;
    },
    createHref: (to) => historikk.createHref(leggTilSkraastrek(to)),
    createURL: (to) => historikk.createURL(leggTilSkraastrek(to)),
    encodeLocation: (to) => historikk.encodeLocation(leggTilSkraastrek(to)),
    push: (to, state) => historikk.push(leggTilSkraastrek(to), state),
    replace: (to, state) => historikk.replace(leggTilSkraastrek(to), state),
    go: (delta) => historikk.go(delta),
    listen: (lytter) => historikk.listen(lytter),
  };
};

export const lagNettleserhistorikk = (basename: string): Historikk =>
  medSkraastrekPaaRot(createBrowserHistory({ v5Compat: true }), basename);
