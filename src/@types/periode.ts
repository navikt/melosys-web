/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
interface Periode {
  fom: string;
  tom: string;
}

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
interface Lovvalgsperiode {
  fomDato: string;
  tomDato: string;
}

export type { Periode, Lovvalgsperiode };
