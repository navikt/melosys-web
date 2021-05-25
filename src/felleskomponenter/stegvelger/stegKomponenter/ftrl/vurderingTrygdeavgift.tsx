import React, { useEffect, useState, ChangeEvent, Fragment, useCallback } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { change, getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { Avgiftsgrunnlag, Avgiftsberegning, AvgiftsgrunnlagInfo } from "Domene";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../utils/navFrontend";
import * as Api from "../../../../services/api";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import { OppdaterAvgiftsberegning } from "../../../../services/modules/trygdeavgift";
import { BOOLSK, BOOLSK_STRING } from "../../../../constants";
import { VurderingTrygdeavgiftVirksomhetTyper } from "../../../../kodeverk/koder";

import "./vurderingTrygdeavgift.css";

const PeriodeTabellComponent = ({ perioder }: { perioder: string[][] | undefined }) => {
  if (!perioder) return null;
  return (
    <table className="periode_tabell">
      <tbody>
        <tr>
          <th key={Utils._uuid()} style={{ width: "30%" }} scope="col">
            Periode
          </th>
          <th key={Utils._uuid()} style={{ width: "40%" }} scope="col">
            Dekning
          </th>
          <th key={Utils._uuid()} style={{ width: "10%" }} scope="col">
            Sats
          </th>
          <th key={Utils._uuid()} style={{ width: "20%" }} scope="col">
            Avgift per måned
          </th>
        </tr>
        {perioder.map((avgiftsPeriode) => (
          <tr className="border_top" key={Utils._uuid()}>
            {avgiftsPeriode.map((listeElement: string) => (
              <td key={Utils._uuid()}>{listeElement}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface TrygdeavgiftsgrunnlagProps {
  formValues: {
    avgiftsberegning?: Avgiftsberegning | undefined;
    avgiftsgrunnlag?: Avgiftsgrunnlag | undefined;
  };
  oppdatertAvgiftsberegning: OppdaterAvgiftsberegning;
  erTabellApen: Map<string, boolean>;
  erVirksomhetNorsk: boolean;
  erSaerligAvgiftsGruppeValgt: Map<string, boolean>;
  erTrygdeavgiftsgrunnlagNorgeUgyldig: boolean;
  erTrygdeavgiftsgrunnlagUtlandUgyldig: boolean;
  handleBeregnClick: (erVirksomhetNorsk: boolean) => void;
  handleSærligAvgiftsgruppeRadioChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void;
  handleAvgiftspliktigLønnInputChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void;
  redigerbart: boolean;
  saerligeavgiftsgrupper: KTObject[];
}

const TrygdeavgiftsgrunnlagComponent = ({
  formValues,
  oppdatertAvgiftsberegning,
  erTabellApen,
  erVirksomhetNorsk,
  erSaerligAvgiftsGruppeValgt,
  erTrygdeavgiftsgrunnlagNorgeUgyldig,
  erTrygdeavgiftsgrunnlagUtlandUgyldig,
  handleBeregnClick,
  handleSærligAvgiftsgruppeRadioChange,
  handleAvgiftspliktigLønnInputChange,
  redigerbart,
  saerligeavgiftsgrupper,
}: TrygdeavgiftsgrunnlagProps) => {
  const Hjelpetekst = () => (
    <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Under}>
      Du skal velge &quot;ja&quot; dersom søker tilhører en spesiell gruppe og det kan ha betydning for trygdeavgiften.
      Dette gjelder følgende grupper:
      <ul>
        <li>Ansatte i FN som betaler staff assessment</li>
        <li>Misjonærer som skal arbeide i utlandet i minst to år</li>
        <li>Arbeidstakere i Malaysia</li>
      </ul>
    </Nav.Hjelpetekst>
  );

  function mapTabell() {
    const avgiftsperioder = erVirksomhetNorsk
      ? formValues?.avgiftsberegning?.avgiftsperioderNorge
      : formValues?.avgiftsberegning?.avgiftsperioderUtland;
    return (
      avgiftsperioder &&
      avgiftsperioder.map((avgiftsperiode) => [
        `${Utils.dato.formatterDatoTilNorsk(avgiftsperiode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
          avgiftsperiode.tom
        )}`,
        KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, avgiftsperiode.trygdedekning),
        avgiftsperiode.avgiftssats,
        `${avgiftsperiode.avgiftPerMd} kroner`,
      ])
    );
  }

  const VurderingsutfallIngenTrygdeavgift = () => {
    if (!formValues || !formValues.avgiftsgrunnlag) return null;
    return (
      <div>
        {(erVirksomhetNorsk ? !erTrygdeavgiftsgrunnlagNorgeUgyldig : !erTrygdeavgiftsgrunnlagUtlandUgyldig) && (
          <Nav.AlertStripeInfo className={`${erVirksomhetNorsk ? "stor_margin_bottom" : "liten_margin_bottom"}`}>
            {erVirksomhetNorsk
              ? formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge &&
                KV.finnTermFraListe(
                  MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt,
                  formValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt
                )
              : formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland &&
                KV.finnTermFraListe(
                  MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt,
                  formValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt
                )}
          </Nav.AlertStripeInfo>
        )}
        {!erVirksomhetNorsk && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.betalerArbeidsgiverAvgift && (
          <Nav.AlertStripeAdvarsel className="stor_margin_bottom">
            Du har oppgitt at utenlandsk virksomhet betaler arbeidsavgift.
          </Nav.AlertStripeAdvarsel>
        )}
      </div>
    );
  };

  if (!formValues.avgiftsgrunnlag) return null;

  const virksomhetType = erVirksomhetNorsk
    ? VurderingTrygdeavgiftVirksomhetTyper.NORSK
    : VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK;
  const feltNavnBase = erVirksomhetNorsk
    ? "avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge"
    : "avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland";
  const ingenTrygdeavgiftBetalesTilNAV = erVirksomhetNorsk
    ? formValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
    : formValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV;
  const trygdeavgiftBetalesTilNAV = erVirksomhetNorsk
    ? formValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_TRYGDEAVGIFT_NAV
    : formValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_TRYGDEAVGIFT_NAV;
  const trygdeavgiftsgrunnlag = erVirksomhetNorsk
    ? formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge
    : formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland;
  const visBetalerArbeidsgiverAvgift =
    !erVirksomhetNorsk ||
    (trygdeavgiftsgrunnlag?.særligAvgiftsgruppe !== undefined &&
      trygdeavgiftsgrunnlag?.særligAvgiftsgruppe !== BOOLSK_STRING.SANN);
  const visErSøkerSkattepliktig =
    trygdeavgiftsgrunnlag?.særligAvgiftsgruppe !== undefined &&
    trygdeavgiftsgrunnlag?.særligAvgiftsgruppe !== BOOLSK_STRING.SANN &&
    trygdeavgiftsgrunnlag?.betalerArbeidsgiverAvgift !== undefined;

  const erSkattepliktigFastsatt = () => {
    if (erVirksomhetNorsk) {
      return trygdeavgiftsgrunnlag?.særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA;
    }
    return [MKV.Koder.saerligeavgiftsgrupper.FN, MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA].includes(
      trygdeavgiftsgrunnlag?.særligAvgiftsgruppe
    );
  };

  return (
    <div className="vurderingTrygdeavgift__overstrek vurderingTrygdeavgift">
      <Nav.Row>
        <Nav.Typo.Undertittel className="sub_undertittel">
          {erVirksomhetNorsk ? "Fra Norge" : "Fra utlandet"}
        </Nav.Typo.Undertittel>

        <Nav.Column xs="4">
          <Nav.Fieldset
            legend={
              <Fragment>
                Tilhører søker en spesiell gruppe?
                <Hjelpetekst />
              </Fragment>
            }
          >
            <Nav.Radio
              className="column"
              label="Ja"
              name={`${virksomhetType}særligAvgiftsgruppe`}
              onChange={(event) => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
              checked={erSaerligAvgiftsGruppeValgt.get(virksomhetType) === true}
              value={BOOLSK_STRING.SANN}
              disabled={!redigerbart}
            />
            <Nav.Radio
              className="column"
              label="Nei"
              name={`${virksomhetType}særligAvgiftsgruppe`}
              onChange={(event) => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
              checked={erSaerligAvgiftsGruppeValgt.get(virksomhetType) === false}
              value={BOOLSK_STRING.USANN}
              disabled={!redigerbart}
            />
            {erSaerligAvgiftsGruppeValgt.get(virksomhetType) === true && (
              <Skjema.Select
                label=""
                disabled={!redigerbart}
                feltNavn={`${feltNavnBase}.særligAvgiftsgruppe`}
                emptyFieldText="Velg gruppe"
                emptyFieldDisabled={
                  (erVirksomhetNorsk
                    ? formValues.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe
                    : formValues.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe) !== "TRUE"
                }
              >
                {saerligeavgiftsgrupper
                  .filter(
                    (avgiftsgruppe) =>
                      avgiftsgruppe.kode !==
                      (erVirksomhetNorsk
                        ? MKV.Koder.saerligeavgiftsgrupper.FN
                        : MKV.Koder.saerligeavgiftsgrupper.MISJONÆR)
                  )
                  .map((saerligavgiftsgruppe: KTObject) => (
                    <option key={saerligavgiftsgruppe.kode} value={saerligavgiftsgruppe.kode}>
                      {saerligavgiftsgruppe.term}
                    </option>
                  ))}
              </Skjema.Select>
            )}
          </Nav.Fieldset>
        </Nav.Column>

        {visBetalerArbeidsgiverAvgift && (
          <Nav.Column xs="4">
            <Nav.Fieldset legend="Betaler virksomheten arbeideravgift?">
              <Nav.Typo.Normaltekst className="ja_nei">
                {trygdeavgiftsgrunnlag?.betalerArbeidsgiverAvgift ? "Ja" : "Nei"}
              </Nav.Typo.Normaltekst>
            </Nav.Fieldset>
          </Nav.Column>
        )}

        {visErSøkerSkattepliktig && (
          <Nav.Column xs="4">
            <Nav.Fieldset legend="Er søker skattepliktig?">
              {erSkattepliktigFastsatt() ? (
                <Nav.Typo.Normaltekst className="ja_nei">
                  {trygdeavgiftsgrunnlag?.erSkattepliktig ? "Ja" : "Nei"}
                </Nav.Typo.Normaltekst>
              ) : (
                <Fragment>
                  <Skjema.Radio
                    className="column"
                    label="Ja"
                    feltNavn={`${feltNavnBase}.erSkattepliktig`}
                    value={BOOLSK.SANN}
                    disabled={!redigerbart}
                    id={`${feltNavnBase}.erSkattepliktig`}
                  />
                  <Skjema.Radio
                    className="column"
                    label="Nei"
                    feltNavn={`${feltNavnBase}.erSkattepliktig`}
                    value={BOOLSK.USANN}
                    disabled={!redigerbart}
                    id={`${feltNavnBase}.erIkkeSkattepliktig`}
                  />
                </Fragment>
              )}
            </Nav.Fieldset>
          </Nav.Column>
        )}
      </Nav.Row>

      {ingenTrygdeavgiftBetalesTilNAV && <VurderingsutfallIngenTrygdeavgift />}

      {trygdeavgiftBetalesTilNAV && (
        <div>
          {!erVirksomhetNorsk && formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.betalerArbeidsgiverAvgift && (
            <Nav.AlertStripeAdvarsel className="stor_margin_bottom">
              Du har oppgitt at utenlandsk virksomhet betaler arbeidsavgift.
            </Nav.AlertStripeAdvarsel>
          )}
          {(erVirksomhetNorsk ? !erTrygdeavgiftsgrunnlagNorgeUgyldig : !erTrygdeavgiftsgrunnlagUtlandUgyldig) && (
            <Nav.Row>
              <Nav.Column xs="4">
                <Nav.Input
                  label="Avgiftspliktig inntekt per måned"
                  value={
                    (erVirksomhetNorsk &&
                      oppdatertAvgiftsberegning.avgiftspliktigLønnNorge !== null &&
                      oppdatertAvgiftsberegning.avgiftspliktigLønnNorge) ||
                    (!erVirksomhetNorsk &&
                      oppdatertAvgiftsberegning.avgiftspliktigLønnUtland !== null &&
                      oppdatertAvgiftsberegning.avgiftspliktigLønnUtland) ||
                    0
                  }
                  bredde="fullbredde"
                  onChange={(event) => handleAvgiftspliktigLønnInputChange(event, erVirksomhetNorsk)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={!redigerbart}
                />
              </Nav.Column>
              <Nav.Column xs="4">
                <Nav.Knapp
                  className="beregn_knapp"
                  onClick={() => handleBeregnClick(erVirksomhetNorsk)}
                  disabled={!redigerbart}
                >
                  {redigerbart ? (
                    <Ikoner.Kalkulator className="beregn_ikon" />
                  ) : (
                    <Ikoner.KalkulatorDisabled className="beregn_ikon" />
                  )}
                  <span>Beregn foreløpig trygdeavgift</span>
                </Nav.Knapp>
              </Nav.Column>
            </Nav.Row>
          )}
        </div>
      )}

      {erTabellApen.get(virksomhetType) && formValues.avgiftsberegning && (
        <Nav.Row>
          <Nav.Column xs="12">
            <PeriodeTabellComponent perioder={mapTabell()} />
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.TRYGDEAVGIFT)(state),
  formValid: formSelectors.VurderTrygdeavgiftFormValid(state),
  saerligeavgiftsgrupper: folketrygdenkodeverkSelectors.SaerligeavgiftsgrupperSelector(state),
  erTrygdeavgiftsgrunnlagNorgeUgyldig: formSelectors.VurderTrygdeavgiftFormErTrygdeavgiftsgrunnlagNorgeUgyldig(state),
  erTrygdeavgiftsgrunnlagUtlandUgyldig: formSelectors.VurderTrygdeavgiftFormErTrygdeavgiftsgrunnlagUtlandUgyldig(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.TRYGDEAVGIFT, field, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  formValues: {
    avgiftsgrunnlag?: Avgiftsgrunnlag;
    avgiftsberegning?: Avgiftsberegning;
  };
  erStegGyldig: boolean;
}

const VurderingTrygdeavgift = ({
  bekreft,
  oppdater,
  tilbake,
  redigerbart,
  behandlingID,
  formValues,
  changeField,
  formValid,
  saerligeavgiftsgrupper,
  erTrygdeavgiftsgrunnlagNorgeUgyldig,
  erTrygdeavgiftsgrunnlagUtlandUgyldig,
  erStegGyldig,
}: Props & PropsFromRedux) => {
  const [erTabellApen, setErTabellApen] = useState(new Map());
  const [erSaerligAvgiftsGruppeValgt, setErSaerligAvgiftsGruppeValgt] = useState(new Map());
  const [oppdatertAvgiftsberegning, setOppdatertAvgiftsberegning] = useState<OppdaterAvgiftsberegning>({
    avgiftspliktigLønnNorge: null,
    avgiftspliktigLønnUtland: null,
  });

  const hentBeregning = () => {
    Api.Trygdeavgift.hentBeregning(behandlingID).then((response) => {
      setOppdatertAvgiftsberegning({
        avgiftspliktigLønnNorge: response.avgiftspliktigLønnNorge,
        avgiftspliktigLønnUtland: response.avgiftspliktigLønnUtland,
      });
      changeField("avgiftsberegning", response);
    });
  };
  const debouncedHentBeregning = useCallback(Utils._debounce(hentBeregning, 1000), []);

  useEffect(() => {
    Api.Trygdeavgift.hentGrunnlag(behandlingID)
      .then((response) => {
        if (response?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe !== undefined) {
          erSaerligAvgiftsGruppeValgt.set(
            VurderingTrygdeavgiftVirksomhetTyper.NORSK,
            !!response.trygdeavgiftsgrunnlagNorge.særligAvgiftsgruppe
          );
        }
        if (response?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe !== undefined) {
          erSaerligAvgiftsGruppeValgt.set(
            VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
            !!response.trygdeavgiftsgrunnlagUtland.særligAvgiftsgruppe
          );
        }
        setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
        changeField("avgiftsgrunnlag", response);
      })
      .catch(Utils.logger.error);
    debouncedHentBeregning();
    return () => debouncedHentBeregning.cancel();
  }, []);

  useEffect(() => {
    oppdater();
  }, [formValid]);

  function erTrygdeavgiftsgrunnlagGyldig(trygdeavgiftsgrunnlag: AvgiftsgrunnlagInfo | null | undefined) {
    return (
      trygdeavgiftsgrunnlag &&
      (trygdeavgiftsgrunnlag.erSkattepliktig || trygdeavgiftsgrunnlag.erSkattepliktig === false) &&
      (trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift || trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift === false) &&
      (trygdeavgiftsgrunnlag.særligAvgiftsgruppe === null ||
        (!!trygdeavgiftsgrunnlag.særligAvgiftsgruppe && trygdeavgiftsgrunnlag.særligAvgiftsgruppe !== "TRUE"))
    );
  }

  function erAvgiftsgrunnlagGyldig(avgiftsgrunnlag: Avgiftsgrunnlag) {
    if (!avgiftsgrunnlag || !avgiftsgrunnlag.lønnsforhold) return false;
    switch (avgiftsgrunnlag.lønnsforhold) {
      case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
        return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge);
      case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
        return !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
      case MKV.Koder.loenn_forhold.DELT_LØNN:
        return (
          !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge) &&
          !!erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland)
        );
      default:
        return false;
    }
  }

  function handleGrunnlagResponse(avgiftsgrunnlag: Avgiftsgrunnlag) {
    if (!avgiftsgrunnlag) return;
    if (
      avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
    ) {
      setErTabellApen(new Map(erTabellApen.set(VurderingTrygdeavgiftVirksomhetTyper.NORSK, false)));
    }
    if (
      avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt ===
      MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
    ) {
      setErTabellApen(new Map(erTabellApen.set(VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK, false)));
    }
    if (avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE) {
      erSaerligAvgiftsGruppeValgt.delete(VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    }
    if (avgiftsgrunnlag.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET) {
      erSaerligAvgiftsGruppeValgt.delete(VurderingTrygdeavgiftVirksomhetTyper.NORSK);
      setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    }
  }

  useEffect(() => {
    if (redigerbart && formValues?.avgiftsgrunnlag && erAvgiftsgrunnlagGyldig(formValues.avgiftsgrunnlag)) {
      Api.Trygdeavgift.sendGrunnlag(behandlingID, {
        lønnsforhold: formValues.avgiftsgrunnlag.lønnsforhold,
        trygdeavgiftsgrunnlagNorge: formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge || null,
        trygdeavgiftsgrunnlagUtland: formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland || null,
      })
        .then((response) => {
          changeField("avgiftsgrunnlag", response);
          handleGrunnlagResponse(response);
        })
        .catch(Utils.logger.error);
    }
  }, [formValues?.avgiftsgrunnlag]);

  function handleSærligAvgiftsgruppeRadioChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
    const erSærligAvgiftsgruppe = Utils.streng.tryParseBool(event.target.value);
    erSaerligAvgiftsGruppeValgt.set(
      erNorskVirksomhet ? VurderingTrygdeavgiftVirksomhetTyper.NORSK : VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
      erSærligAvgiftsgruppe
    );
    setErSaerligAvgiftsGruppeValgt(new Map(erSaerligAvgiftsGruppeValgt));
    const fieldBase = erNorskVirksomhet
      ? "avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge"
      : "avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland";
    changeField(`${fieldBase}.særligAvgiftsgruppe`, erSærligAvgiftsgruppe ? "TRUE" : null);
    changeField(`${fieldBase}.betalerArbeidsgiverAvgift`, erNorskVirksomhet ? BOOLSK.SANN : BOOLSK.USANN);
    changeField(`${fieldBase}.erSkattepliktig`, undefined);
  }

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe;
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.MISJONÆR) {
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", BOOLSK.USANN);
    }
    if (særligAvgiftsgruppe === MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA) {
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.betalerArbeidsgiverAvgift", BOOLSK.SANN);
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge.erSkattepliktig", BOOLSK.USANN);
    }
  }, [formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagNorge?.særligAvgiftsgruppe]);

  useEffect(() => {
    const særligAvgiftsgruppe = formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe;
    if (
      [MKV.Koder.saerligeavgiftsgrupper.FN, MKV.Koder.saerligeavgiftsgrupper.ARBEIDSTAKER_MALAYSIA].includes(
        særligAvgiftsgruppe
      )
    ) {
      changeField("avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland.erSkattepliktig", BOOLSK.USANN);
    }
  }, [formValues?.avgiftsgrunnlag?.trygdeavgiftsgrunnlagUtland?.særligAvgiftsgruppe]);

  function handleAvgiftspliktigLønnInputChange(event: ChangeEvent<HTMLInputElement>, erNorskVirksomhet: boolean) {
    setOppdatertAvgiftsberegning(
      erNorskVirksomhet
        ? { ...oppdatertAvgiftsberegning, avgiftspliktigLønnNorge: parseInt(event.target.value, 10) }
        : { ...oppdatertAvgiftsberegning, avgiftspliktigLønnUtland: parseInt(event.target.value, 10) }
    );
  }

  function handleBeregnClick(erNorskVirksomhet: boolean) {
    Api.Trygdeavgift.sendBeregning(behandlingID, oppdatertAvgiftsberegning)
      .then((response) => {
        changeField("avgiftsberegning", response);
      })
      .catch(Utils.logger.error);
    setErTabellApen(
      new Map(
        erTabellApen.set(
          erNorskVirksomhet
            ? VurderingTrygdeavgiftVirksomhetTyper.NORSK
            : VurderingTrygdeavgiftVirksomhetTyper.UTENLANDSK,
          true
        )
      )
    );
  }

  const lønnsforholdErLønnFraNorge =
    formValues?.avgiftsgrunnlag?.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_NORGE;
  const lønnsforholdErLønnFraUtlandet =
    formValues?.avgiftsgrunnlag?.lønnsforhold === MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET;
  const lønnsforholdErDeltLønn = formValues?.avgiftsgrunnlag?.lønnsforhold === MKV.Koder.loenn_forhold.DELT_LØNN;

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Undertittel className="undertittel">Trygdeavgift</Nav.Typo.Undertittel>

      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend="Hvor mottar søker inntekt fra?">
            <Skjema.Radio
              label="Norsk virksomhet"
              feltNavn="avgiftsgrunnlag.lønnsforhold"
              value={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              id={MKV.Koder.loenn_forhold.LØNN_FRA_NORGE}
              disabled={!redigerbart}
              defaultChecked={lønnsforholdErLønnFraNorge}
            />
            <Skjema.Radio
              feltNavn="avgiftsgrunnlag.lønnsforhold"
              label="Utenlandsk virksomhet"
              value={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              id={MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET}
              disabled={!redigerbart}
              defaultChecked={lønnsforholdErLønnFraUtlandet}
            />
            <Skjema.Radio
              label="Norsk og utenlandsk virksomhet"
              feltNavn="avgiftsgrunnlag.lønnsforhold"
              value={MKV.Koder.loenn_forhold.DELT_LØNN}
              id={MKV.Koder.loenn_forhold.DELT_LØNN}
              disabled={!redigerbart}
              defaultChecked={lønnsforholdErDeltLønn}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>

      {(lønnsforholdErLønnFraNorge || lønnsforholdErDeltLønn) && (
        <TrygdeavgiftsgrunnlagComponent
          erVirksomhetNorsk
          formValues={formValues}
          oppdatertAvgiftsberegning={oppdatertAvgiftsberegning}
          erTabellApen={erTabellApen}
          erSaerligAvgiftsGruppeValgt={erSaerligAvgiftsGruppeValgt}
          handleBeregnClick={handleBeregnClick}
          handleSærligAvgiftsgruppeRadioChange={handleSærligAvgiftsgruppeRadioChange}
          handleAvgiftspliktigLønnInputChange={handleAvgiftspliktigLønnInputChange}
          redigerbart={redigerbart}
          erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig}
          erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig}
          saerligeavgiftsgrupper={saerligeavgiftsgrupper}
        />
      )}
      {(lønnsforholdErLønnFraUtlandet || lønnsforholdErDeltLønn) && (
        <TrygdeavgiftsgrunnlagComponent
          erVirksomhetNorsk={false}
          formValues={formValues}
          oppdatertAvgiftsberegning={oppdatertAvgiftsberegning}
          erTabellApen={erTabellApen}
          erSaerligAvgiftsGruppeValgt={erSaerligAvgiftsGruppeValgt}
          handleBeregnClick={handleBeregnClick}
          handleSærligAvgiftsgruppeRadioChange={handleSærligAvgiftsgruppeRadioChange}
          handleAvgiftspliktigLønnInputChange={handleAvgiftspliktigLønnInputChange}
          redigerbart={redigerbart}
          erTrygdeavgiftsgrunnlagNorgeUgyldig={erTrygdeavgiftsgrunnlagNorgeUgyldig}
          erTrygdeavgiftsgrunnlagUtlandUgyldig={erTrygdeavgiftsgrunnlagUtlandUgyldig}
          saerligeavgiftsgrupper={saerligeavgiftsgrupper}
        />
      )}

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !erStegGyldig}
          className="fane__navigasjonsknapp"
          onClick={bekreft}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingTrygdeavgiftForm = reduxForm<{}, Props & PropsFromRedux>({
  form: KV.Form.TRYGDEAVGIFT,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingTrygdeavgiftSchema),
})(VurderingTrygdeavgift);

export default connector(VurderingTrygdeavgiftForm);
