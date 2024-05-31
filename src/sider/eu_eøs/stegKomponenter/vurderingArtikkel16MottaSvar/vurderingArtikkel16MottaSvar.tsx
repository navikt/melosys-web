import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Services from "../../../../services";
import { DatoOmradeMedVarighet } from "../../../../felleskomponenter/datoOmrade";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { formSelectors } from "../../../../ducks/form";
import {
  anmodningsperiodesvarOperations,
  anmodningsperiodesvarSelectors,
} from "../../../../ducks/anmodningsperiodesvar";
import { lagAnmodningsperiodesvar } from "../../../../felleskomponenter/stegvelger";
import "./vurderingArtikkel16MottaSvar.css";
import { KTObject } from "@navikt/melosys-kodeverk";
import FormKomponent from "./formKomponent";
import { AnmodningsperiodesvarResDto } from "../../../../services/modules/anmodningsperioder/svar/svar";

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

const VurderingArtikkel16MottaSvar = ({
  redigerbart,
  bekreftOgFortsett,
  slettData,
  tilbake,
  tilstand,
  oppdaterData,
}: VurderingArtikkel16MottaSvarProps) => {
  const dispatch = useDispatch();
  const anmodningsperiodeID = useSelector(anmodningsperioderSelectors.AnmodningsperiodeIDSelector);
  const gyldigeSoknadsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const anmodningsperioderSvarStatus = useSelector(anmodningsperiodesvarSelectors.ReduxStatusSelector);
  const formIsValid = useSelector(formSelectors.Artikkel16MottaSvarSyncErrorsSelector) === undefined;
  const [anmodningsperioderSvarHentet, setAnmodningsperioderSvarHentet] = useState(false);

  useEffect(() => {
    // @ts-ignore
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)).then(
      (svar: { data: AnmodningsperiodesvarResDto }) => oppdaterData(lagAnmodningsperiodesvar(svar.data))
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
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Svar på anmodning om unntak, etter artikkel 16, nr. 1
      </Nav.Typo.Innholdstittel>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Typo.Element>Land:</Nav.Typo.Element>
          <Nav.Typo.Normaltekst>
            {gyldigeSoknadsland.map((enkeltLandObjekt: KTObject) => enkeltLandObjekt.term).join(", ")}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="soknadsperiodeRow">
        <Nav.Column xs="6">
          <DatoOmradeMedVarighet periode={soknadsperiode} label="Søknadsperiode" />
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
    </Fragment>
  );
};

export default VurderingArtikkel16MottaSvar;
