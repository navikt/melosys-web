/* eslint-disable react/no-multi-comp */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { FieldArray, getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";

import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { behandlingsperioderSelectors } from "../../../ducks/behandlingsperioder";
import { dokumenterSelectors } from "../../../ducks/dokumenter";

import { datoDiffMenneskelig, formatterDatoTilNorsk } from "../../../utils/dato";
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../../yup";
import DatoOmrade from "../../datoOmrade/datoOmrade";
import PdfLenkeListe from "../../pdfLenkeListe";
import Mottakerinstitusjonvelger from "../../mottakerinstitusjonvelger";
import VedleggVelger from "../../vedleggvelger";
import { FeatureToggle } from "../../../featuretoggle";

import { konverterTilStegData, lagBegrunnelse } from "../../../regler/vilkar";
import { konverterLovvalgsbestemmelseTilStegData } from "../../../regler/lovvalgsbestemmelser";
import {
  konverterUnntakFraBestemmelseTilStegData,
  lagUnntakFraBestemmelse,
} from "../../../regler/unntakfrabestemmelse";

import "./vurderingArtikkel16Anmodning.css";
import * as Skjema from "../../skjema";

const uuid = require("uuid/v4");

const TidligereMedlemPeriodeLinje = ({ perm, onChange, checked, redigerbart, feil }) => {
  const { periodeID, periode } = perm;
  const label = `Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`;

  return (
    <Mui.Checkbox
      feil={feil}
      disabled={!redigerbart}
      onCheck={() => onChange(periodeID)}
      label={label}
      checked={checked}
    />
  );
};

TidligereMedlemPeriodeLinje.propTypes = {
  checked: PT.bool.isRequired,
  index: PT.number.isRequired,
  onChange: PT.func.isRequired,
  perm: MPT.MedlemskapEnkeltPeriode.isRequired,
  redigerbart: PT.bool.isRequired,
  feil: PT.object,
};

TidligereMedlemPeriodeLinje.defaultProps = {
  feil: undefined,
};

class TidligereMedlemskapPerioder extends Component {
  onChange = async (periodeID) => {
    const { fields, oppdaterOgLagreBehandlinger } = this.props;
    const { push, remove } = fields;
    const alleValgtePeriodeID = fields.getAll() || [];
    const eksistererVedPosisjon = alleValgtePeriodeID.findIndex((valgt) => valgt === periodeID);

    if (eksistererVedPosisjon === -1) {
      await push(periodeID);
    } else {
      await remove(eksistererVedPosisjon);
    }

    oppdaterOgLagreBehandlinger().catch((e) => Utils.logger.error(e));
  };

  render() {
    const { medlemskap, fields, redigerbart, feil } = this.props;
    const alleValgtePeriodeID = fields.getAll() || [];
    const { onChange } = this;

    const { perioderMed } = medlemskap;
    return (
      <div>
        {perioderMed &&
          perioderMed.map((perm, index) => {
            const isChecked = alleValgtePeriodeID.includes(perm.periodeID);
            return (
              <TidligereMedlemPeriodeLinje
                feil={feil}
                redigerbart={redigerbart}
                onChange={onChange}
                checked={isChecked}
                key={uuid()}
                perm={perm}
                index={index}
              />
            );
          })}
      </div>
    );
  }
}

TidligereMedlemskapPerioder.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  feil: PT.object,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
};

TidligereMedlemskapPerioder.defaultProps = {
  feil: undefined,
};

const TidligereMedlemskap = (props) => (
  <div>
    <FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapPerioder} props={props.feil} {...props} />
  </div>
);

TidligereMedlemskap.propTypes = {
  feil: PT.object,
};

TidligereMedlemskap.defaultProps = {
  feil: undefined,
};

class VurderingArtikkel16Anmodning extends Component {
  state = {
    lovvalgFeilmelding: undefined,
    begrunnelserFeilmelding: undefined,
    begrunnelseFritekstBrevFeilmelding: undefined,
    begrunnelseFritekstSedFeilmelding: undefined,
    anmodningPending: false,
    valgteVedlegg: [],
  };

  componentDidMount() {
    const {
      oppdaterData,
      tilstand: { art16_1 },
      unntakFraBestemmelse,
    } = this.props;
    oppdaterData(konverterTilStegData("art16_1_anmodning", art16_1));
    oppdaterData(
      konverterLovvalgsbestemmelseTilStegData(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1
      )
    );
    oppdaterData(konverterUnntakFraBestemmelseTilStegData(unntakFraBestemmelse));

    this._isMounted = true;
  }

  componentWillUnmount() {
    this.props.slettData();

    this._isMounted = false;
  }

  setValgteVedlegg = (valgteVedlegg) => {
    this.setState({ valgteVedlegg });
  };

  lagBestillAnmodningsperioderBody = () => ({
    mottakerinstitusjon: this.props.formValues.mottakerinstitusjon || null,
    fritekstSed: this.props.formValues.fritekstSed,
    vedlegg: this.state.valgteVedlegg.map(({ journalpostID, dokumentID }) => ({ journalpostID, dokumentID })),
  });

  lagreBehandlingerOgBestillAnmodningsperioder = async () => {
    const { oppdaterOgLagreBehandlinger, lagreOgBestillAnmodningsperioder } = this.props;

    await oppdaterOgLagreBehandlinger();
    return lagreOgBestillAnmodningsperioder(this.lagBestillAnmodningsperioderBody());
  };

  vedUnntakFraBestemmelseEndring = async (event) => {
    const { oppdaterData } = this.props;
    const { byggAnmodningsperioderHandler, lagreAnmodningsperioderHandler } = this.props;

    oppdaterData(lagUnntakFraBestemmelse(event.target.value));

    await byggAnmodningsperioderHandler();
    await lagreAnmodningsperioderHandler();

    this.setState({ lovvalgFeilmelding: undefined });
  };

  byggAnmodningsperioder = () => {
    const { byggAnmodningsperioderHandler } = this.props;

    byggAnmodningsperioderHandler();

    this.setState({ lovvalgFeilmelding: undefined });
  };

  lagreVilkar = () => {
    this.props.lagreVilkarHandler().catch((e) => Utils.logger.error(e));
  };

  lagreBehandlinger = () => {
    this.props.oppdaterOgLagreBehandlinger().catch((e) => Utils.logger.error(e));
  };

  begrunnelseFritekstBrevEndretHandler = (event) => {
    this.setState({ begrunnelseFritekstBrevFeilmelding: undefined });

    const { oppdaterData } = this.props;
    const { id, value } = event.target;

    oppdaterData(lagBegrunnelse(id, null, value));
  };

  begrunnelseFritekstSedEndretHandler = (event) => {
    this.setState({ begrunnelseFritekstSedFeilmelding: undefined });

    const { oppdaterData } = this.props;
    const { id, value } = event.target;

    oppdaterData(lagBegrunnelse(id, null, null, value));
  };

  begrunnelseFritekstFokusFlyttetHandler = () => {
    this.lagreVilkar();
  };

  begrunnelserEndringHandler = async ({ target }) => {
    this.setState({ begrunnelserFeilmelding: undefined });

    const { value } = target;
    const begrunnelse = value ? [value] : [];
    const { oppdaterData } = this.props;
    await oppdaterData(lagBegrunnelse("art16_1_anmodning", begrunnelse));
    this.lagreVilkar();
  };

  validerUnntakFraBestemmelse = () => {
    const valid = this.props.unntakFraBestemmelse;
    if (!valid) this.setState({ lovvalgFeilmelding: { feilmelding: "Velg lovvalg" } });
    return valid;
  };

  validerBegrunnelser = () => {
    const { begrunnelseKoder } = this.props.tilstand.art16_1;
    const valid = begrunnelseKoder.length !== 0;
    if (!valid) this.setState({ begrunnelserFeilmelding: "Velg begrunnelser" });
    return valid;
  };

  validerFritekst = () => {
    const begrunnelseFritekstBrevValid = this.props.tilstand.art16_1.begrunnelseFritekst;
    if (!begrunnelseFritekstBrevValid)
      this.setState({ begrunnelseFritekstBrevFeilmelding: { feilmelding: "Fyll inn fritekst" } });

    const begrunnelseFritekstEngelskValid = this.props.tilstand.art16_1.begrunnelseFritekstEngelsk;
    if (!begrunnelseFritekstEngelskValid)
      this.setState({ begrunnelseFritekstSedFeilmelding: { feilmelding: "Fyll inn fritekst" } });

    return begrunnelseFritekstBrevValid && begrunnelseFritekstEngelskValid;
  };

  validerAlt = () => {
    const { begrunnelseKoder } = this.props.tilstand.art16_1;
    const { touch, formIsValid } = this.props;

    const lovvalgValid = this.validerUnntakFraBestemmelse();
    const begrunnelserValid = this.validerBegrunnelser();
    const fritekstValid = begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN)
      ? this.validerFritekst()
      : true;
    touch("mottakerinstitusjon");

    return lovvalgValid && begrunnelserValid && fritekstValid && formIsValid;
  };

  validerOgLagreBehandling = async () => {
    if (this.validerAlt()) {
      this.setState({ anmodningPending: true });

      await this.byggAnmodningsperioder();
      await this.lagreBehandlingerOgBestillAnmodningsperioder();

      // Anmodning-operation navigerer til forside, og komponenten kan derfor være unmountet.
      if (this._isMounted) {
        this.setState({ anmodningPending: false });
      }
    }
  };

  render() {
    const {
      anmodningsperiode,
      behandlingID,
      medlemskap,
      redigerbart,
      tilstand,
      unntakFraBestemmelse,
      arbeidsland,
      formValues,
      form,
      fysiskeDokument,
    } = this.props;

    const {
      begrunnelserEndringHandler,
      validerAlt,
      validerOgLagreBehandling,
      begrunnelseFritekstFokusFlyttetHandler,
      begrunnelseFritekstBrevEndretHandler,
      begrunnelseFritekstSedEndretHandler,
      vedUnntakFraBestemmelseEndring,
      setValgteVedlegg,
    } = this;

    const {
      begrunnelserFeilmelding,
      begrunnelseFritekstBrevFeilmelding,
      begrunnelseFritekstSedFeilmelding,
      lovvalgFeilmelding,
      anmodningPending,
      valgteVedlegg,
    } = this.state;

    const antallManeder = datoDiffMenneskelig(anmodningsperiode.fomDato, anmodningsperiode.tomDato);

    const landSomTekstListe = arbeidsland.map((enkeltLandObjekt) => enkeltLandObjekt.term).join(", ");

    const pdfDokumenter = formValues.kreverMottakerinstitusjon
      ? [
          {
            navn: "Forhåndsvis orienteringsbrev til bruker",
            type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK,
            data: {
              mottaker: MKV.Koder.aktoersroller.BRUKER,
            },
          },
          {
            navn: "Forhåndsvis SED A001",
            type: EKV.Koder.sedtyper.A001,
            erSed: true,
            data: {
              fritekst: this.props.formValues.fritekstSed,
            },
          },
        ]
      : [
          {
            navn: "Forhåndsvis orienteringsbrev til bruker",
            type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK,
            data: {
              mottaker: MKV.Koder.aktoersroller.BRUKER,
            },
          },
          {
            navn: "Forhåndsvis anmodning til utenlandsk myndighet",
            type: MKV.Koder.brev.produserbaredokumenter.ANMODNING_UNNTAK,
            data: {
              mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
              ytterligereInformasjon: this.props.formValues.fritekstSed,
            },
          },
        ];

    const {
      art16_1: { begrunnelseFritekst, begrunnelseFritekstEngelsk, begrunnelseKoder },
      muligeBegrunnelseValg,
      erIDirekteTilArtikkel16Flyt,
    } = tilstand;

    const begrunnelseKode = begrunnelseKoder ? begrunnelseKoder[0] : "";

    const visBegrunnelseFritekstFelter = begrunnelseKoder.includes(
      MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN
    );

    const begrunnelseFritekstBrev = begrunnelseFritekst || "";
    const begrunnelseFritekstSed = begrunnelseFritekstEngelsk || "";

    const begrunnelseFritekstBrevLabel = (
      <Fragment>
        <Nav.typo.Element>Begrunnelse til orienteringsbrev til bruker</Nav.typo.Element>
        <Nav.typo.Normaltekst>
          Begrunnelsen kommer ut i vedtaksbrevet som en setning som starter med «Vi har bedt trygdemyndighetene i [land]
          om en avtale for deg, fordi», og slutter med teksten du har tilføyd.
        </Nav.typo.Normaltekst>
      </Fragment>
    );

    /* eslint-disable max-len */
    return (
      <div>
        <Nav.typo.Undertittel>Anmodning om unntak etter artikkel 16.1</Nav.typo.Undertittel>
        <div className="artikkel16">
          {erIDirekteTilArtikkel16Flyt && (
            <Nav.Row className="vilAnmode">
              <Nav.Column xs="6">
                <Nav.Radio
                  name="vilAnmode"
                  label="Ja, jeg vil anmode om unntak"
                  defaultChecked
                  disabled={!redigerbart}
                />
                <Nav.Radio name="vilAnmode" label="Nei, jeg vil avslå" disabled />
              </Nav.Column>
            </Nav.Row>
          )}
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.typo.Element type="element">Det lands lovgivning det søkes unntak fra:</Nav.typo.Element>
              <Nav.typo.Normaltekst>{landSomTekstListe}</Nav.typo.Normaltekst>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.typo.Element type="element">Antall måneder:</Nav.typo.Element>
              <Nav.typo.Normaltekst>{antallManeder}</Nav.typo.Normaltekst>
              <DatoOmrade periode={{ fom: anmodningsperiode.fomDato, tom: anmodningsperiode.tomDato }} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                feil={lovvalgFeilmelding}
                onChange={vedUnntakFraBestemmelseEndring}
                value={unntakFraBestemmelse || ""}
                disabled={!redigerbart}
                label={<Nav.typo.Element>Artikkelen det søkes unntak fra:</Nav.typo.Element>}
                data-cy="unntakArtikkel"
              >
                <option key={uuid()} value="">
                  Velg...
                </option>
                {MKV.Kodekombinasjoner.unntaksbestemmelser.map((kodeObjekt) => (
                  <option key={uuid()} value={kodeObjekt.kode}>
                    {kodeObjekt.term}
                  </option>
                ))}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Select
                feil={begrunnelserFeilmelding}
                onChange={begrunnelserEndringHandler}
                value={begrunnelseKode}
                disabled={!redigerbart}
                label={<Nav.typo.Element>Legg til begrunnelse:</Nav.typo.Element>}
                data-cy="begrunnelse"
              >
                <option key={uuid()} value="">
                  Velg...
                </option>
                {muligeBegrunnelseValg.map((kodeObjekt) => (
                  <option key={uuid()} value={kodeObjekt.kode}>
                    {kodeObjekt.term}
                  </option>
                ))}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              {visBegrunnelseFritekstFelter && (
                <Fragment>
                  <Nav.Textarea
                    id="art16_1_anmodning"
                    label={begrunnelseFritekstBrevLabel}
                    placeholder="Skriv begrunnelsen her."
                    disabled={!redigerbart}
                    onBlur={begrunnelseFritekstFokusFlyttetHandler}
                    onChange={begrunnelseFritekstBrevEndretHandler}
                    value={begrunnelseFritekstBrev}
                    feil={begrunnelseFritekstBrevFeilmelding}
                    maxLength={255}
                    bredde="fullbredde"
                  />
                  {redigerbart && (
                    <Nav.Textarea
                      id="art16_1_anmodning"
                      label={<Nav.typo.Element>Begrunnelse til SED A001</Nav.typo.Element>}
                      placeholder="Skriv begrunnelsen her."
                      onBlur={begrunnelseFritekstFokusFlyttetHandler}
                      onChange={begrunnelseFritekstSedEndretHandler}
                      value={begrunnelseFritekstSed}
                      feil={begrunnelseFritekstSedFeilmelding}
                      maxLength={255}
                      bredde="fullbredde"
                    />
                  )}
                </Fragment>
              )}
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="12">
              <Nav.Fieldset legend={`Velg direkte forutgående perioder i ${landSomTekstListe}:`}>
                <TidligereMedlemskap
                  oppdaterOgLagreBehandlinger={this.props.oppdaterOgLagreBehandlinger}
                  redigerbart={redigerbart}
                  medlemskap={medlemskap}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          {redigerbart && (
            <Nav.Row className="fritekstSed">
              <Nav.Column xs="7">
                <Skjema.Textarea
                  label={<Nav.typo.Element>Ytterligere informasjon til SED (valgfri)</Nav.typo.Element>}
                  feltNavn="fritekstSed"
                  disabled={!redigerbart}
                  visTellerFra={500}
                  maxLength={500}
                />
              </Nav.Column>
            </Nav.Row>
          )}
          <Nav.Row className="mottakerinstitusjoner">
            <Nav.Column xs="7">
              <Mottakerinstitusjonvelger
                form={form}
                redigerbart={redigerbart}
                landkode={arbeidsland[0].kode}
                bucType={EKV.Koder.buctyper.legislation.LA_BUC_01}
              />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="6">
              {redigerbart && (
                <PdfLenkeListe vedKlikk={validerAlt} behandlingID={behandlingID} dokumenter={pdfDokumenter} />
              )}
            </Nav.Column>
          </Nav.Row>
          <FeatureToggle togglename="melosys.anmodning_vedlegg">
            {(status) =>
              status === "enabled" ? (
                <Nav.Row>
                  <Nav.Column xs="12">
                    <Nav.typo.Undertittel>Vedlegg til SED</Nav.typo.Undertittel>
                    <VedleggVelger
                      valgteVedlegg={valgteVedlegg}
                      onChange={setValgteVedlegg}
                      dokumenter={fysiskeDokument}
                    />
                  </Nav.Column>
                </Nav.Row>
              ) : null
            }
          </FeatureToggle>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Hovedknapp
                spinner={anmodningPending}
                autoDisableVedSpinner
                disabled={!redigerbart}
                onClick={validerOgLagreBehandling}
              >
                Send brevene
              </Nav.Hovedknapp>
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
    );
  }
}

VurderingArtikkel16Anmodning.propTypes = {
  anmodningsperiode: PT.object,
  medlemskap: MPT.Medlemskap.isRequired,
  lagreOgBestillAnmodningsperioder: PT.func.isRequired,
  arbeidsland: PT.arrayOf(PT.string).isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
  unntakFraBestemmelse: PT.string,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    muligeBegrunnelseValg: PT.arrayOf(MPT.Kodeverk).isRequired,
    erIDirekteTilArtikkel16Flyt: PT.bool.isRequired,
    art16_1: PT.object.isRequired,
  }).isRequired,
  byggAnmodningsperioderHandler: PT.func.isRequired,
  touch: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  form: PT.string.isRequired,
  fysiskeDokument: PT.arrayOf(PT.object).isRequired,
};

VurderingArtikkel16Anmodning.defaultProps = {
  unntakFraBestemmelse: "",
  anmodningsperiode: {},
  formValues: {},
};

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  unntakFraBestemmelse: anmodningsperioderSelectors.UnntakFraBestemmelseSelector(state),
  fysiskeDokument: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  initialValues: {
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    fritekstSed: null,
  },
});

const VurderingArtikkel16AnmodningForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_ANMODNING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values) => lagYupToReduxformErrorMapper(YupSkjemaer.artikkel16_anmodning)(values),
})(VurderingArtikkel16Anmodning);

export default connect(mapStateToProps)(VurderingArtikkel16AnmodningForm);
