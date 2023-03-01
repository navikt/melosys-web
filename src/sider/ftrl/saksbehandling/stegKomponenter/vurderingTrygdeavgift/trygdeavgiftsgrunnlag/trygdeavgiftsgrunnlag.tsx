import React, { ChangeEvent, Fragment } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../../melosyskodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Api from "../../../../../../services/api";
import * as Ikoner from "../../../../../../resources/images";
import * as Utils from "../../../../../../utils";
import * as KV from "../../../../../../kodeverk";
import * as Skjema from "../../../../../../felleskomponenter/skjema";

import PeriodeTabell from "./periodetabell";
import SpesiellGruppeHjelpetekst from "./spesiellGruppeHjelpeTekst";
import { OppdaterAvgiftsberegning } from "../../../../../../services/modules/trygdeavgift";
import { BOOLSK_STRING } from "../../../../../../constants";
import { VurderingTrygdeavgiftVirksomhetTyper } from "../../../../../../kodeverk/koder";

interface TrygdeavgiftsgrunnlagProps {
  formValues: {
    avgiftsberegning?: Api.Avgiftsberegning | undefined;
    avgiftsgrunnlag?: Api.Avgiftsgrunnlag | undefined;
  };
  errors: any;
  control: any;
  setValue: (field: string, value: string) => void;
  oppdatertAvgiftsberegning: OppdaterAvgiftsberegning;
  erTabellApen: Map<string, boolean>;
  erVirksomhetNorsk: boolean;
  erSaerligAvgiftsGruppeValgt: Map<string, boolean>;
  erTrygdeavgiftsgrunnlagNorgeUgyldig: boolean;
  erTrygdeavgiftsgrunnlagUtlandUgyldig: boolean;
  handleErSøkerPliktigChange: () => void;
  handleBeregnClick: (erVirksomhetNorsk: boolean) => void;
  handleSærligAvgiftsgruppeRadioChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void;
  handleAvgiftspliktigLønnInputChange: (event: ChangeEvent<HTMLInputElement>, erVirksomhetNorsk: boolean) => void;
  redigerbart: boolean;
  saerligeavgiftsgrupper: KTObject[];
}

const Trygdeavgiftsgrunnlag = ({
  formValues,
  setValue,
  control,
  errors,
  oppdatertAvgiftsberegning,
  erTabellApen,
  erVirksomhetNorsk,
  handleErSøkerPliktigChange,
  erSaerligAvgiftsGruppeValgt,
  erTrygdeavgiftsgrunnlagNorgeUgyldig,
  erTrygdeavgiftsgrunnlagUtlandUgyldig,
  handleBeregnClick,
  handleSærligAvgiftsgruppeRadioChange,
  handleAvgiftspliktigLønnInputChange,
  redigerbart,
  saerligeavgiftsgrupper,
}: TrygdeavgiftsgrunnlagProps) => {
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
  const feltNavnIngenTrygdeavgiftBetalesTilNAV = erVirksomhetNorsk
    ? {
        feltNavn: "avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt",
        verdi: MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV,
      }
    : {
        feltNavn: "avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt",
        verdi: MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV,
      };

  const feltNavnTrygdeavgiftBetalesTilNAV = erVirksomhetNorsk
    ? {
        feltNavn: "avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt",
        verdi: MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_TRYGDEAVGIFT_NAV,
      }
    : {
        feltNavn: "avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt",
        verdi: MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_TRYGDEAVGIFT_NAV,
      };
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
  const erSkattepliktig = trygdeavgiftsgrunnlag?.erSkattepliktig;
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
                <SpesiellGruppeHjelpetekst erVirksomhetNorsk={erVirksomhetNorsk} />
              </Fragment>
            }
          >
            <Nav.Radio
              className="column"
              label="Ja"
              name={`${virksomhetType}særligAvgiftsgruppe`}
              feil={errors[virksomhetType]?.særligAvgiftsgruppe?.message?.melding}
              onChange={(event) => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
              checked={erSaerligAvgiftsGruppeValgt.get(virksomhetType) === true}
              value={BOOLSK_STRING.SANN}
              disabled={!redigerbart}
            />
            <Nav.Radio
              className="column"
              label="Nei"
              name={`${virksomhetType}særligAvgiftsgruppe`}
              feil={errors[virksomhetType]?.særligAvgiftsgruppe?.message?.melding}
              onChange={(event) => handleSærligAvgiftsgruppeRadioChange(event, erVirksomhetNorsk)}
              checked={erSaerligAvgiftsGruppeValgt.get(virksomhetType) === false}
              value={BOOLSK_STRING.USANN}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
          {erSaerligAvgiftsGruppeValgt.get(virksomhetType) === true && (
            <Skjema.SelectV2
              label=""
              disabled={!redigerbart}
              name={`${feltNavnBase}.særligAvgiftsgruppe`}
              feil={errors[feltNavnBase]?.særligAvgiftsgruppe?.message?.melding}
              control={control}
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
            </Skjema.SelectV2>
          )}
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
                  <Skjema.RadioV2
                    className="column"
                    label="Ja"
                    name={`${feltNavnBase}.erSkattepliktig`}
                    feil={errors[feltNavnBase]?.erSkattepliktig?.message?.melding}
                    control={control}
                    checked={
                      erSkattepliktig === null || erSkattepliktig === undefined ? undefined : Boolean(erSkattepliktig)
                    }
                    onChange={() => {
                      setValue(
                        feltNavnIngenTrygdeavgiftBetalesTilNAV.feltNavn,
                        feltNavnIngenTrygdeavgiftBetalesTilNAV.verdi
                      );
                      handleErSøkerPliktigChange();
                    }}
                    value={BOOLSK_STRING.SANN}
                    disabled={!redigerbart}
                  />
                  <Skjema.RadioV2
                    className="column"
                    label="Nei"
                    name={`${feltNavnBase}.erSkattepliktig`}
                    feil={errors[feltNavnBase]?.erSkattepliktig?.message?.melding}
                    control={control}
                    onChange={() => {
                      setValue(feltNavnTrygdeavgiftBetalesTilNAV.feltNavn, feltNavnTrygdeavgiftBetalesTilNAV.verdi);
                      handleErSøkerPliktigChange();
                    }}
                    checked={
                      erSkattepliktig === null || erSkattepliktig === undefined ? undefined : Boolean(!erSkattepliktig)
                    }
                    value={BOOLSK_STRING.USANN}
                    disabled={!redigerbart}
                  />
                </Fragment>
              )}
            </Nav.Fieldset>
          </Nav.Column>
        )}
      </Nav.Row>

      {ingenTrygdeavgiftBetalesTilNAV && <VurderingsutfallIngenTrygdeavgift />}

      {trygdeavgiftBetalesTilNAV && (
        <>
          <div>
            {!erVirksomhetNorsk &&
              formValues.avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland?.betalerArbeidsgiverAvgift && (
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
          {erTabellApen.get(virksomhetType) && formValues.avgiftsberegning && (
            <Nav.Row>
              <Nav.Column xs="12">
                <PeriodeTabell perioder={mapTabell()} />
              </Nav.Column>
            </Nav.Row>
          )}
        </>
      )}
    </div>
  );
};

export default Trygdeavgiftsgrunnlag;
