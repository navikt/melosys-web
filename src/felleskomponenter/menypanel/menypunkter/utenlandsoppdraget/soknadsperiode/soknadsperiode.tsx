import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import * as Symboler from "../../symboler";

import { Periode } from "../../../../../services/modules/behandlingsgrunnlag/types";
import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from "../../../../../ducks/behandlingsgrunnlag";
import { formSelectors } from "../../../../../ducks/form";
import { erFeatureToggleEnabled } from "../../../../../featuretoggle";

import SoknadsperiodeEndring from "./soknadsperiodeEndring";

import "./soknadsperiode.css";

const mapStateToProps = (state: RootState) => ({
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
  soknadsperiodeFomErrors: formSelectors.SoknadsperiodeFomErrorsSelector(state),
  soknadsperiodeTomErrors: formSelectors.SoknadsperiodeTomErrorsSelector(state),
  behandlingHarLand: behandlingsgrunnlagSelectors.HarLandSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterPeriode: (periode: Periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
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

  const oppdaterPeriode = (fom: string, tom: string) => {
    props.oppdaterPeriode({
      fom: fom ? Utils.dato.formatterDatoTilISO(fom) : "",
      tom: tom ? Utils.dato.formatterDatoTilISO(tom) : "",
    });
  };

  useEffect(() => {
    return () => {
      oppdaterPeriode(soknadsperiodeGammelFom, soknadsperiodeGammelTom);
    };
  }, []);

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
    const tomLandOgPeriodeToggleEnabled = await erFeatureToggleEnabled("melosys.tom_periode_og_land");

    if (tomLandOgPeriodeToggleEnabled) {
      const flytMedInngangsvilkår =
        window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

      if (!behandlingHarLand && flytMedInngangsvilkår) {
        skjulEndrePeriode();
      } else {
        // Når melosys.tom_periode_og_land fjernes må vi forsikre oss om at den nyeste perioden
        // konsekvent lagres før vi oppfrisker saksopplysningene.
        // Se history på filen for å se tidligere hack.
        lagreSoknadOgOppfriskSaksopplysninger();
        skjulEndrePeriode();
      }
    } else {
      lagreSoknadOgOppfriskSaksopplysninger();
      skjulEndrePeriode();
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
          {redigerbart && <Symboler.Rediger onClick={visEndrePeriode} />}
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
