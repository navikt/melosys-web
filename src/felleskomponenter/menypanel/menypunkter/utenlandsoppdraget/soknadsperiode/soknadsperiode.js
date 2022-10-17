import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import PT from "prop-types";

import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import * as Symboler from "../../symboler";

import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from "../../../../../ducks/behandlingsgrunnlag";
import { formSelectors } from "../../../../../ducks/form";
import { erFeatureToggleEnabled } from "../../../../../featuretoggle";

import SoknadsperiodeEndring from "./soknadsperiodeEndring";

import "./soknadsperiode.css";

export const Soknadsperiode = ({
  redigerbart,
  tittel,
  soknadsperiodeFomErrors,
  soknadsperiodeTomErrors,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingHarLand,
  ...props
}) => {
  const [erEndrePeriodeSynlig, setErEndrePeriodeSynlig] = useState(false);
  const [soknadsperiodeFom, setSoknadsperiodeFom] = useState(props.soknadsperiodeFom);
  const [soknadsperiodeTom, setSoknadsperiodeTom] = useState(props.soknadsperiodeTom);
  const [soknadsperiodeGammelFom, setSoknadsperiodeGammelFom] = useState(props.soknadsperiodeFom);
  const [soknadsperiodeGammelTom, setSoknadsperiodeGammelTom] = useState(props.soknadsperiodeTom);

  const oppdaterPeriode = (fom, tom) => {
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
          skjulEndrePeriode={skjulEndrePeriode}
          lagre={lagre}
          setSoknadsperiodeFom={setSoknadsperiodeFom}
          setSoknadsperiodeTom={setSoknadsperiodeTom}
          avbryt={avbryt}
        />
      )}
    </div>
  );
};

Soknadsperiode.propTypes = {
  redigerbart: PT.bool.isRequired,
  oppdaterPeriode: PT.func.isRequired,
  lagreSoknadOgOppfriskSaksopplysninger: PT.func.isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
  soknadsperiodeFomErrors: PT.string,
  soknadsperiodeTomErrors: PT.string,
  tittel: PT.string.isRequired,
  behandlingHarLand: PT.bool.isRequired,
};

Soknadsperiode.defaultProps = {
  soknadsperiodeFomErrors: undefined,
  soknadsperiodeTomErrors: undefined,
};

const mapStateToProps = (state) => ({
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
  soknadsperiodeFomErrors: formSelectors.SoknadsperiodeFomErrorsSelector(state),
  soknadsperiodeTomErrors: formSelectors.SoknadsperiodeTomErrorsSelector(state),
  behandlingHarLand: behandlingsgrunnlagSelectors.HarLandSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  oppdaterPeriode: (periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Soknadsperiode);
