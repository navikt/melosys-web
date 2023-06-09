import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import * as Symboler from "../../symboler";
import * as Hooks from "../../../../../hooks";

import { Periode } from "../../../../../services/modules/mottatteOpplysninger/types";
import {
  mottatteOpplysningerOperations,
  mottatteOpplysningerSelectors,
} from "../../../../../ducks/mottatteOpplysninger";
import { formSelectors } from "../../../../../ducks/form";

import SoknadsperiodeEndring from "./soknadsperiodeEndring";

import "./soknadsperiode.css";

const mapStateToProps = (state: RootState) => ({
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).tom),
  soknadsperiodeFomErrors: formSelectors.SoknadsperiodeFomErrorsSelector(state),
  soknadsperiodeTomErrors: formSelectors.SoknadsperiodeTomErrorsSelector(state),
  behandlingHarLand: mottatteOpplysningerSelectors.HarLandSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterPeriode: (periode: Periode) => dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SoknadsperiodeProps = PropsFromRedux & {
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  tittel: string;
};

export const Soknadsperiode = ({
  redigerbart,
  tittel,
  soknadsperiodeFomErrors,
  soknadsperiodeTomErrors,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingHarLand,
  ...props
}: SoknadsperiodeProps) => {
  const [erEndrePeriodeSynlig, setErEndrePeriodeSynlig] = useState(false);
  const [soknadsperiodeFom, setSoknadsperiodeFom] = useState(props.soknadsperiodeFom);
  const [soknadsperiodeTom, setSoknadsperiodeTom] = useState(props.soknadsperiodeTom);
  const [soknadsperiodeGammelFom, setSoknadsperiodeGammelFom] = useState(props.soknadsperiodeFom);
  const [soknadsperiodeGammelTom, setSoknadsperiodeGammelTom] = useState(props.soknadsperiodeTom);
  const isMounted = Hooks.useIsMounted();

  const oppdaterPeriode = (fom: string, tom: string) => {
    props.oppdaterPeriode({
      fom: fom ? Utils.dato.formatterDatoTilISO(fom) : "",
      tom: tom ? Utils.dato.formatterDatoTilISO(tom) : "",
    });
  };

  useEffect(() => {
    return () => {
      if (!isMounted.current) oppdaterPeriode(soknadsperiodeGammelFom, soknadsperiodeGammelTom);
    };
  }, [soknadsperiodeGammelFom, soknadsperiodeGammelTom]);

  useEffect(() => {
    oppdaterPeriode(soknadsperiodeFom, soknadsperiodeTom);
  }, [soknadsperiodeFom, soknadsperiodeTom]);

  const visEndrePeriode = () => setErEndrePeriodeSynlig(true);

  const skjulEndrePeriode = () => setErEndrePeriodeSynlig(false);

  const resetLokalPeriode = () => {
    setSoknadsperiodeFom(soknadsperiodeGammelFom);
    setSoknadsperiodeTom(soknadsperiodeGammelTom);
  };

  const oppfriskSaksopplysingerVedLagre = async () => {
    const flytMedInngangsvilkår =
      window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

    if (!behandlingHarLand && flytMedInngangsvilkår) {
      skjulEndrePeriode();
    } else {
      // Todo: Denne er hacky. Bakgrunn: oppdatert soknad rekker ikke å re-propagate til parent før
      // funksjonen nedenfor kalles. Vurder å skrive om til en async await-aktig løsning.
      setTimeout(() => {
        lagreSoknadOgOppfriskSaksopplysninger();
        skjulEndrePeriode();
      }, 0);
    }
  };

  const lagre = () => {
    oppdaterPeriode(soknadsperiodeFom, soknadsperiodeTom);
    setSoknadsperiodeGammelFom(soknadsperiodeFom);
    setSoknadsperiodeGammelTom(soknadsperiodeTom);
    oppfriskSaksopplysingerVedLagre();
  };

  const avbryt = () => {
    resetLokalPeriode();
    skjulEndrePeriode();
  };

  return (
    <div className="soknadsperiode">
      <Nav.Typo.Normaltekst className="soknadsperiode__etikett">{tittel}</Nav.Typo.Normaltekst>
      {!erEndrePeriodeSynlig && (
        <div className="periode__container">
          <Nav.Typo.Element className="periode">
            {soknadsperiodeFom} - {soknadsperiodeTom}
          </Nav.Typo.Element>
          {redigerbart && (
            <div>
              <Symboler.Rediger onClick={visEndrePeriode} />
            </div>
          )}
        </div>
      )}
      {erEndrePeriodeSynlig && (
        <SoknadsperiodeEndring
          soknadsperiodeFom={soknadsperiodeFom}
          soknadsperiodeTom={soknadsperiodeTom}
          soknadsperiodeFomErrors={soknadsperiodeFomErrors}
          soknadsperiodeTomErrors={soknadsperiodeTomErrors}
          lagre={lagre}
          setSoknadsperiodeFom={setSoknadsperiodeFom}
          setSoknadsperiodeTom={setSoknadsperiodeTom}
          avbryt={avbryt}
        />
      )}
    </div>
  );
};

export default connector(Soknadsperiode);
