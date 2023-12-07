/* eslint-disable react/no-multi-comp */
import { Component, Fragment } from "react";
import { connect } from "react-redux";
import { FieldArray, getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";
import { v4 as uuid } from "uuid";
import * as Api from "../../../services/api";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";
import * as Skjema from "../../../felleskomponenter/skjema";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { behandlingsperioderSelectors } from "../../../ducks/behandlingsperioder";
import { dokumenterSelectors } from "../../../ducks/dokumenter";
import { datoDiffMenneskelig, formatterDatoTilNorsk } from "../../../utils/dato";
import DatoOmrade from "../../../felleskomponenter/datoOmrade";
import Dokumentliste from "../../../felleskomponenter/dokumentliste";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";
import Mottakerinstitusjonvelger from "../../../felleskomponenter/mottakerinstitusjonvelger";
import VedleggVelger from "../../../felleskomponenter/vedleggvelger";
import VedleggTable from "../../../felleskomponenter/vedleggTable";
import {
  konverterVilkarTilStegData,
  lagVilkarbegrunnelse,
  konverterLovvalgsbestemmelseTilStegData,
  konverterUnntakFraBestemmelseTilStegData,
  lagUnntakFraBestemmelse,
} from "../../../felleskomponenter/stegvelger";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel16AnmodningSchema from "./vurderingArtikkel16AnmodningSchema";

import "./vurderingArtikkel16Anmodning.css";
import { kontrollOperations } from "../../../ducks/kontroll";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";

const TidligereMedlemPeriodeLinje = ({ perm, onChange, checked, redigerbart }) => {
  const { periodeID, periode } = perm;
  const label = `Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`;

  return <Mui.Checkbox disabled={!redigerbart} onCheck={() => onChange(periodeID)} label={label} checked={checked} />;
};

TidligereMedlemPeriodeLinje.propTypes = {
  checked: PT.bool.isRequired,
  index: PT.number.isRequired,
  onChange: PT.func.isRequired,
  perm: MPT.MedlemskapEnkeltPeriode.isRequired,
  redigerbart: PT.bool.isRequired,
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

    oppdaterOgLagreBehandlinger();
  };

  render() {
    const { medlemskap, fields, redigerbart } = this.props;
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
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
};

const TidligereMedlemskap = (props) => (
  <div>
    <FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapPerioder} {...props} />
  </div>
);

class VurderingArtikkel16Anmodning extends Component {
  state = {
    lovvalgFeilmelding: undefined,
    begrunnelserFeilmelding: undefined,
    begrunnelseFritekstBrevFeilmelding: undefined,
    begrunnelseFritekstSedFeilmelding: undefined,
    sendBrevFeilmelding: undefined,
    anmodningPending: false,
    valgteVedlegg: [],
    harFeil: false,
    sjekkerAdresse: false,
  };

  componentDidUpdate(prevProps) {
    const { sjekkerAdresse } = this.state;
    const { mottatteOpplysningerStatus } = this.props;
    if (mottatteOpplysningerStatus === "OK" && !sjekkerAdresse && prevProps.mottatteOpplysningerStatus !== "OK") {
      this.kontroller();
    }
  }
  componentDidMount() {
    const {
      oppdaterData,
      tilstand: { art16_1 },
      unntakFraBestemmelse,
    } = this.props;
    oppdaterData(konverterVilkarTilStegData("art16_1_anmodning", art16_1));
    oppdaterData(
      konverterLovvalgsbestemmelseTilStegData(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1
      )
    );

    if (unntakFraBestemmelse) {
      oppdaterData(konverterUnntakFraBestemmelseTilStegData(unntakFraBestemmelse));
    }

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
    this.props.lagreVilkarHandler();
  };

  begrunnelseFritekstBrevEndretHandler = (event) => {
    this.setState({ begrunnelseFritekstBrevFeilmelding: undefined });

    const { oppdaterData } = this.props;
    const { id, value } = event.target;

    oppdaterData(lagVilkarbegrunnelse(id, null, value));
  };

  begrunnelseFritekstSedEndretHandler = (event) => {
    this.setState({ begrunnelseFritekstSedFeilmelding: undefined });

    const { oppdaterData } = this.props;
    const { id, value } = event.target;

    oppdaterData(lagVilkarbegrunnelse(id, null, null, value));
  };

  begrunnelseFritekstFokusFlyttetHandler = () => {
    this.lagreVilkar();
  };

  begrunnelserEndringHandler = async ({ target }) => {
    this.setState({ begrunnelserFeilmelding: undefined });

    const { value } = target;
    const begrunnelse = value ? [value] : [];
    const { oppdaterData } = this.props;
    await oppdaterData(lagVilkarbegrunnelse("art16_1_anmodning", begrunnelse));
    this.lagreVilkar();
  };

  validerArbeidsgivere = () => {
    if (this.props.valgteVirksomheter.length === 1) {
      this.setState({ sendBrevFeilmelding: undefined });
      return true;
    }
    this.setState({
      sendBrevFeilmelding: MKV.Terms.begrunnelser.kontroll_begrunnelser.IKKE_KUN_EN_VIRKSOMHET,
    });
    return false;
  };

  validerUnntakFraBestemmelse = () => {
    const valid = this.props.unntakFraBestemmelse;
    if (!valid) this.setState({ lovvalgFeilmelding: "Velg lovvalg" });
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
    if (!begrunnelseFritekstBrevValid) this.setState({ begrunnelseFritekstBrevFeilmelding: "Fyll inn fritekst" });

    const begrunnelseFritekstEngelskValid = this.props.tilstand.art16_1.begrunnelseFritekstEngelsk;
    if (!begrunnelseFritekstEngelskValid) this.setState({ begrunnelseFritekstSedFeilmelding: "Fyll inn fritekst" });

    return begrunnelseFritekstBrevValid && begrunnelseFritekstEngelskValid;
  };

  validerAlt = () => {
    const { begrunnelseKoder } = this.props.tilstand.art16_1;
    const { touch, formIsValid } = this.props;

    const arbeidsgivereValid = this.validerArbeidsgivere();
    const lovvalgValid = this.validerUnntakFraBestemmelse();
    const begrunnelserValid = this.validerBegrunnelser();
    const fritekstValid = begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN)
      ? this.validerFritekst()
      : true;
    touch("mottakerinstitusjon");

    return arbeidsgivereValid && lovvalgValid && begrunnelserValid && fritekstValid && formIsValid;
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

  kontroller = async () => {
    const { oppdaterKontrollFeil, resetKontrollFeil, behandlingID } = this.props;
    this.setState({ sjekkerAdresse: true });
    Api.Kontroll.kontrollerAdresse({
      behandlingID,
    })
      .then((res) => {
        if (res.kontrollfeilList && res.kontrollfeilList.length > 0) {
          this.setState({ harFeil: true, sendBrevFeilmelding: undefined, sjekkerAdresse: false });
          oppdaterKontrollFeil({
            kontrollfeilList: res.kontrollfeilList,
          });
        } else {
          resetKontrollFeil();
          this.setState({ harFeil: false, sendBrevFeilmelding: undefined, sjekkerAdresse: false });
        }
      })
      .catch(() => {
        const feilmelding =
          "En teknisk feil skjedde da adresser skulle sjekkes. Prøv igjen eller kontakt brukerstøtte hvis problemet vedvarer.";
        this.setState({ harFeil: true, sendBrevFeilmelding: feilmelding, sjekkerAdresse: false });
      });
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
      tilbake,
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
      sendBrevFeilmelding,
      anmodningPending,
      valgteVedlegg,
      harFeil,
    } = this.state;

    const antallManeder = datoDiffMenneskelig(anmodningsperiode.fomDato, anmodningsperiode.tomDato);

    const landSomTekstListe = arbeidsland.map((enkeltLandObjekt) => enkeltLandObjekt.term).join(", ");

    const pdfDokumenter = formValues.kreverMottakerinstitusjon
      ? [
          {
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK,
              mottaker: MKV.Koder.mottakerroller.BRUKER,
            },
          },
          {
            dokumentNavn: "SED A001",
            type: EKV.Koder.sedtyper.A001,
            sedData: {
              fritekst: this.props.formValues.fritekstSed,
            },
          },
        ]
      : [
          {
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK,
              mottaker: MKV.Koder.mottakerroller.BRUKER,
            },
          },
          {
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.ANMODNING_UNNTAK,
              mottaker: MKV.Koder.mottakerroller.UTENLANDSK_TRYGDEMYNDIGHET,
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
        <Nav.Typo.Element>Begrunnelse til orienteringsbrev til bruker</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>
          Begrunnelsen kommer ut i vedtaksbrevet som en setning som starter med «Vi har bedt trygdemyndighetene i [land]
          om en avtale for deg, fordi», og slutter med teksten du har tilføyd.
        </Nav.Typo.Normaltekst>
      </Fragment>
    );

    /* eslint-disable max-len */
    return (
      <div>
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Anmodning om unntak etter artikkel 16.1
        </Nav.Typo.Innholdstittel>
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
              <Nav.Typo.Element type="element">Det lands lovgivning det søkes unntak fra:</Nav.Typo.Element>
              <Nav.Typo.Normaltekst>{landSomTekstListe}</Nav.Typo.Normaltekst>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.Typo.Element type="element">Antall måneder:</Nav.Typo.Element>
              <Nav.Typo.Normaltekst>{antallManeder}</Nav.Typo.Normaltekst>
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
                label={<Nav.Typo.Element>Artikkelen det søkes unntak fra:</Nav.Typo.Element>}
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
                label={<Nav.Typo.Element>Legg til begrunnelse:</Nav.Typo.Element>}
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
                    maxLength={1500}
                    bredde="fullbredde"
                  />
                  {redigerbart && (
                    <Nav.Textarea
                      id="art16_1_anmodning"
                      label={<Nav.Typo.Element>Begrunnelse til SED A001</Nav.Typo.Element>}
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
                  label={<Nav.Typo.Element>Ytterligere informasjon til SED (valgfri)</Nav.Typo.Element>}
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
            <Nav.Column xs="10">
              {redigerbart && (
                <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={validerAlt} />
              )}
            </Nav.Column>
          </Nav.Row>
          {redigerbart && (
            <Nav.Row>
              <Nav.Column xs="6">
                <VedleggTable
                  valgteVedlegg={valgteVedlegg}
                  label="Vedlegg til SED"
                  setValgteVedlegg={setValgteVedlegg}
                />
                <VedleggVelger valgteVedlegg={valgteVedlegg} onChange={setValgteVedlegg} dokumenter={fysiskeDokument} />
              </Nav.Column>
            </Nav.Row>
          )}
          {sendBrevFeilmelding && (
            <Nav.AlertStripe type={harFeil ? "feil" : "advarsel"} className="varsel">
              {sendBrevFeilmelding}
            </Nav.AlertStripe>
          )}
          <Nav.Row className="artikkel16__ekstratopp">
            <Mui.StegKnapper
              bekreftTekst="Send brevene"
              bekreftKnappProps={{
                spinner: anmodningPending,
                autoDisableVedSpinner: true,
                disabled: !redigerbart || harFeil,
                onClick: validerOgLagreBehandling,
              }}
              tilbakeKnappProps={{
                onClick: tilbake,
                disabled: !redigerbart,
              }}
            />
          </Nav.Row>
        </div>
      </div>
    );
  }
}

VurderingArtikkel16Anmodning.propTypes = {
  anmodningsperiode: PT.object,
  arbeidsgivereIPerioden: PT.arrayOf(MPT.Virksomhet).isRequired,
  medlemskap: MPT.Medlemskap.isRequired,
  lagreOgBestillAnmodningsperioder: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
  unntakFraBestemmelse: PT.string,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  tilstand: PT.shape({
    muligeBegrunnelseValg: PT.arrayOf(MPT.Kodeverk).isRequired,
    erIDirekteTilArtikkel16Flyt: PT.bool.isRequired,
    art16_1: PT.object.isRequired,
  }).isRequired,
  byggAnmodningsperioderHandler: PT.func.isRequired,
  touch: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  mottatteOpplysningerStatus: PT.string.isRequired,
  form: PT.string.isRequired,
  fysiskeDokument: PT.arrayOf(PT.object).isRequired,
  oppdaterKontrollFeil: PT.func.isRequired,
  resetKontrollFeil: PT.func.isRequired,
  valgteVirksomheter: PT.array,
};

VurderingArtikkel16Anmodning.defaultProps = {
  unntakFraBestemmelse: "",
  anmodningsperiode: {},
  formValues: {},
  valgteVirksomheter: [],
};

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  arbeidsgivereIPerioden: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  unntakFraBestemmelse: anmodningsperioderSelectors.UnntakFraBestemmelseSelector(state),
  fysiskeDokument: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  valgteVirksomheter: avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
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
  validate: (values) => lagYupToReduxformErrorMapper(VurderingArtikkel16AnmodningSchema)(values),
})(VurderingArtikkel16Anmodning);

const mapDispatchToProps = (dispatch) => ({
  oppdaterKontrollFeil: (kontrollBegrunnelse) => dispatch(kontrollOperations.oppdaterKontrollFeil(kontrollBegrunnelse)),
  resetKontrollFeil: () => dispatch(kontrollOperations.resetKontrollFeil()),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel16AnmodningForm);
