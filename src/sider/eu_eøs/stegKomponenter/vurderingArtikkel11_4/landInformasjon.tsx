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
      <Nav.BodyLong weight="semibold" size="small" className="info_label">
        Arbeidsland er
      </Nav.BodyLong>
      <Nav.BodyLong size="small">{arbeidsLandSetning}</Nav.BodyLong>
      <Nav.BodyLong weight="semibold" size="small" className="info_label">
        Arbeidsgiver / selvstendig næringsdrivende har virksomhet i
      </Nav.BodyLong>
      <Nav.BodyLong size="small">{virksomhetsLandSetning}</Nav.BodyLong>
      <Nav.BodyLong weight="semibold" size="small" className="info_label">
        Søker er bosatt i
      </Nav.BodyLong>
      <Nav.BodyLong size="small">{KV.objektTilTerm(bostedsland)}</Nav.BodyLong>
    </div>
  );
};

export default LandInformasjon;
