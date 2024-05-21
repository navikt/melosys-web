import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import { arrayTilKonjunksjon, storeForbokstaverForLand } from "../../../../utils/streng";
import { KTObject } from "@navikt/melosys-kodeverk";
import { useSelector } from "react-redux";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";

export interface Virksomhet {
  navn?: string;
  virksomhetId: string;
  adresse: {
    land?: string;
  };
}

const LandInformasjon = () => {
  const valgteVirksomheter = useSelector(avklartefaktaSelectors.AvklarteVirksomheterSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const bostedsland = useSelector(avklartefaktaSelectors.BostedslandSelector);

  const virksomhetLandListe = valgteVirksomheter.reduce((samling: string[], virksomhet: Virksomhet) => {
    const land = virksomhet?.adresse?.land;
    if (!land) return [...samling];
    return [...samling, storeForbokstaverForLand(land)];
  }, []);

  const virksomhetsLandSetning = arrayTilKonjunksjon(virksomhetLandListe);
  const arbeidsLandSetning = arrayTilKonjunksjon(arbeidsland.map((land: KTObject) => KV.objektTilTerm(land)));

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
