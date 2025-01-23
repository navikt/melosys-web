import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Services from "../../../../services";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { formSelectors } from "../../../../ducks/form";
import {
  anmodningsperiodesvarOperations,
  anmodningsperiodesvarSelectors,
} from "../../../../ducks/anmodningsperiodesvar";
import { lagAnmodningsperiodesvar } from "../../../../felleskomponenter/stegvelger";
import { KTObject } from "@navikt/melosys-kodeverk";
import FormKomponent from "./formKomponent";
import { AnmodningsperiodesvarResDto } from "../../../../services/modules/anmodningsperioder/svar/svar";
import EnkeltDato from "../../../../felleskomponenter/enkeltDato";
import { datoDiffMenneskelig } from "../../../../utils/dato";

import "./vurderingArtikkel16MottaSvar.css";

interface VurderingArtikkel16MottaSvarProps {
  bekreftOgFortsett: () => void;
  tilbake: () => void;
  tilstand: {
    harAvklaring: boolean;
  };
  redigerbart: boolean;
  oppdaterData: (data: any) => void;
  slettData: () => void;
}

function VurderingArtikkel16MottaSvar({
  redigerbart,
  bekreftOgFortsett,
  slettData,
  tilbake,
  tilstand,
  oppdaterData,
}: VurderingArtikkel16MottaSvarProps) {
  const dispatch = useDispatch();
  const anmodningsperiodeID = useSelector(anmodningsperioderSelectors.AnmodningsperiodeIDSelector);
  const gyldigeSoknadsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const anmodningsperioderSvarStatus = useSelector(anmodningsperiodesvarSelectors.ReduxStatusSelector);
  const formIsValid = useSelector(formSelectors.Artikkel16MottaSvarSyncErrorsSelector) === undefined;
  const [anmodningsperioderSvarHentet, setAnmodningsperioderSvarHentet] = useState(false);

  useEffect(() => {
    // @ts-expect-error generisk beskrivelse
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)).then(
      (svar: { data: AnmodningsperiodesvarResDto }) => oppdaterData(lagAnmodningsperiodesvar(svar.data)),
    );

    return () => {
      slettData();
    };
  }, []);

  useEffect(() => {
    if (anmodningsperioderSvarStatus === Services.STATUS.OK) {
      setAnmodningsperioderSvarHentet(true);
    }
  }, [anmodningsperioderSvarStatus]);

  return (
    <div className="vurderingArtikkel16MottaSvar">
      <Nav.Heading level="1" className="stegvelgertittel">
        Svar på anmodning om unntak
      </Nav.Heading>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.BodyLong weight="semibold" size="small">
            Land
          </Nav.BodyLong>
          <Nav.BodyLong size="small">
            {gyldigeSoknadsland.map((enkeltLandObjekt: KTObject) => enkeltLandObjekt.term).join(", ")}
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.BodyLong weight="semibold" size="small">
            Søknadsperiode
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs="12" className="soknadsperiode__innhold">
          <EnkeltDato dato={soknadsperiode.fom} />
          &nbsp;-&nbsp;
          <EnkeltDato dato={soknadsperiode.tom} />
          <Nav.BodyLong size="small">{datoDiffMenneskelig(soknadsperiode.fom, soknadsperiode.tom)}</Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
      {anmodningsperioderSvarHentet && (
        <FormKomponent
          redigerbart={redigerbart}
          soknadsperiode={soknadsperiode}
          oppdaterData={oppdaterData}
          formIsValid={formIsValid}
        />
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !redigerbart || !formIsValid || !tilstand.harAvklaring,
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          disabled: !redigerbart,
          onClick: tilbake,
        }}
      />
    </div>
  );
}

export default VurderingArtikkel16MottaSvar;
