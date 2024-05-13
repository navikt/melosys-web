import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import { arrayTilKonjunksjon } from "../../../../utils/streng";
import { KTObject } from "@navikt/melosys-kodeverk";

export interface Virksomhet {
  navn?: string;
  virksomhetId: string;
  adresse: {
    land?: string;
  };
}

interface LandInformasjonProps {
  bostedsland?: KTObject;
  arbeidsland: KTObject[];
  valgteVirksomheter: Virksomhet[];
}

const LandInformasjon = ({ valgteVirksomheter, arbeidsland, bostedsland }: LandInformasjonProps) => {
  const virksomhetLandListe = valgteVirksomheter.reduce((samling: string[], virksomhet: Virksomhet) => {
    const land = virksomhet?.adresse?.land;
    if (!land) return [...samling];
    const landMedstorForbokstav = land.charAt(0).toUpperCase() + land.slice(1).toLowerCase();
    return [...samling, landMedstorForbokstav];
  }, []);

  const virksomhetsLandSetning = arrayTilKonjunksjon(virksomhetLandListe);
  const arbeidsLandSetning = arrayTilKonjunksjon(arbeidsland.map((land) => KV.objektTilTerm(land)));

  return (
    <div className="land_informasjon">
      <Nav.Typo.Element className="info_label">Arbeidsland er</Nav.Typo.Element>
      <Nav.Typo.Normaltekst>{arbeidsLandSetning}</Nav.Typo.Normaltekst>
      <Nav.Typo.Element className="info_label">
        Arbeidsgiver / selvstendig næringsdrivende har virksomhet i
      </Nav.Typo.Element>
      <Nav.Typo.Normaltekst>{virksomhetsLandSetning}</Nav.Typo.Normaltekst>
      <Nav.Typo.Element className="info_label">Søker er bosatt i</Nav.Typo.Element>
      <Nav.Typo.Normaltekst>{KV.objektTilTerm(bostedsland)}</Nav.Typo.Normaltekst>
    </div>
  );
};

export default LandInformasjon;
