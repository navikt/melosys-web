import React, { useState } from "react";
import { connect } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV, { Utils as MKVUtils } from "../../../melosyskodeverk";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../utils/navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";
import * as Hooks from "../../../hooks";

import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { flytSelectors } from "../../../ducks/flyt";

import PdfLenkeListe from "../../pdfLenkeListe";
import DatoOmrade from "../../datoOmrade/datoOmrade";
import Mottakerinstitusjonvelger from "../../mottakerinstitusjonvelger";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel12VedtakSchema from "./vurderingArtikkel12VedtakSchema";

import "./vurderingVedtak.css";

const finnLovvalgSomTerm = (lovvalgsbestemmelse = {}, tilleggsbestemmelse = {}) => {
  if (
    lovvalgsbestemmelse.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A &&
    tilleggsbestemmelse.kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1
  ) {
    return `${KV.objektTilTerm(tilleggsbestemmelse)} og ${KV.objektTilTerm(lovvalgsbestemmelse)}`;
  }

  return KV.objektTilTerm(lovvalgsbestemmelse);
};

const finnSedMottakerLand = (arbeidsland, bostedsland, lovvalgsperiode) => {
  const bostedslandKode = bostedsland.kode;

  if (
    lovvalgsperiode.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A &&
    lovvalgsperiode.tilleggBestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1
  ) {
    return bostedslandKode;
  }

  return arbeidsland[0].kode;
};

const VurderingVedtak = ({
  lovvalgsperioder,
  arbeidsland,
  bostedsland,
  redigerbart,
  behandlingID,
  lagreOgFatteVedtak,
  behandlingstype,
  behandlingstema,
  touch,
  formIsValid,
  formValues,
  form,
  visAntallManederUtland,
  pdfDokumenter,
  erArtikkel11_4,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  const lovvalget = lovvalgsperioder[0] || {};

  const { fomDato, tomDato, lovvalgsbestemmelse, tilleggBestemmelse } = lovvalget;

  const antallManederMenneskelig = Utils.dato.datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, MKV.Kodekombinasjoner.alleLovvalg);
  const tilleggBestemmelseSomKodeTerm = KV.finnEnkeltKodeFraListe(
    tilleggBestemmelse,
    MKV.Kodekombinasjoner.alleLovvalg
  );
  const lovvalgSomTerm = finnLovvalgSomTerm(lovvalgSomKodeTerm, tilleggBestemmelseSomKodeTerm);
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const erSoknadEllerNyVurdering = MKVUtils.erSoknad(behandlingstema) || erNyVurdering;
  const bucType = erArtikkel11_4 ? EKV.Koder.buctyper.legislation.LA_BUC_05 : EKV.Koder.buctyper.legislation.LA_BUC_04;

  const validerForm = () => {
    touch("tomDato");
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    touch("mottakerinstitusjon");
    touch("fritekstSed");
    return formIsValid;
  };

  const fattVedtak = async () => {
    if (!validerForm()) return;

    setVedtakPending(true);

    await lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: formValues.fritekstSed,
      mottakerinstitusjoner: erSoknadEllerNyVurdering ? [formValues.mottakerinstitusjon] : [],
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: formValues.vedtakstypebegrunnelse,
    });

    // Vedtak-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  const sedMottakerLand = finnSedMottakerLand(arbeidsland, bostedsland || {}, lovvalget);
  const flereLandEnnLovlig =
    arbeidsland.length > 1 && behandlingstema !== MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;

  return (
    <div className="vedtak">
      <Nav.Typo.Undertittel>Omfattet av norsk trygdelovgivning etter {lovvalgSomTerm}</Nav.Typo.Undertittel>
      <div>
        <Nav.Row className="lovvalgsperiode">
          <Nav.Column xs="6">
            <DatoOmrade periode={{ fom: lovvalget.fomDato, tom: lovvalget.tomDato }} label="Lovvalgsperiode" />
          </Nav.Column>
        </Nav.Row>
        {visAntallManederUtland && (
          <Nav.Row className="vedtak__oppsummering">
            <Nav.Column xs="6">
              <Nav.Typo.Element type="element">Antall måneder i utlandet</Nav.Typo.Element>
              <Nav.Typo.Normaltekst>{antallManederMenneskelig}</Nav.Typo.Normaltekst>
            </Nav.Column>
          </Nav.Row>
        )}
        {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
        <Nav.Row className="fritekst">
          <Nav.Column xs="7">
            <Skjema.Textarea
              feltNavn="vedtaksbrevFritekst"
              label="Fritekst til vedtaksbrev"
              placeholder="Skriv inn tekst til vedtaksbrevet..."
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {redigerbart && (
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="7">
              <Skjema.Textarea
                label="Ytterligere informasjon til SED (valgfri)"
                feltNavn="fritekstSed"
                disabled={!redigerbart}
                visTellerFra={500}
                maxLength={500}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        {erSoknadEllerNyVurdering && (
          <Nav.Row className="mottakerinstitusjoner">
            <Nav.Column xs="7">
              <Mottakerinstitusjonvelger
                form={form}
                redigerbart={redigerbart}
                landkode={sedMottakerLand}
                bucType={bucType}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row>
          <Nav.Column xs="6">
            {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          </Nav.Column>
        </Nav.Row>
        {flereLandEnnLovlig && (
          <Nav.AlertStripe type="feil">Det er kun tillat med ett arbeidsland i vedtaket.</Nav.AlertStripe>
        )}
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Hovedknapp
              spinner={vedtakPending}
              autoDisableVedSpinner
              disabled={!redigerbart || flereLandEnnLovlig}
              onClick={fattVedtak}
            >
              Fatt vedtak
            </Nav.Hovedknapp>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  lagreOgFatteVedtak: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  bostedsland: MPT.Kodeverk,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
  behandlingstype: PT.string.isRequired,
  behandlingstema: PT.string.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  form: PT.string.isRequired,
  visAntallManederUtland: PT.bool,
  pdfDokumenter: MPT.DokumentMetadataListe.isRequired,
  erArtikkel11_4: PT.bool.isRequired,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: "",
  formValues: {},
  visAntallManederUtland: true,
  bostedsland: {},
};

const mapStateToProps = (state) => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_12_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_12_VEDTAK)(state),
  erArtikkel11_4: flytSelectors.ErIArtikkel11_4Selector(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    fritekstSed: null,
  },
});

const VurderingVedtakForm = reduxForm({
  form: KV.Form.ARTIKKEL_12_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArtikkel12VedtakSchema, {
      context: {
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingVedtak);

export default connect(mapStateToProps)(VurderingVedtakForm);
