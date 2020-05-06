/* eslint-disable react/no-multi-comp */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FieldArray, getFormValues, isValid, reduxForm } from 'redux-form';
import PT from 'prop-types';
import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import * as KV from '../../../kodeverk';

import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';
import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { anmodningsperioderSelectors } from '../../../ducks/anmodningsperioder';
import { behandlingsperioderSelectors } from '../../../ducks/behandlingsperioder';

import { datoDiffMenneskelig, formatterDatoTilNorsk } from '../../../utils/dato';
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from '../../../yup';
import DatoOmrade from '../../datoOmrade/datoOmrade';
import PdfLenkeListe from '../../pdfLenkeListe';
import Mottakerinstitusjonvelger from '../../mottakerinstitusjonvelger';

import { konverterTilStegData, lagBegrunnelse } from '../../../regler/vilkar';
import { konverterLovvalgsbestemmelseTilStegData } from '../../../regler/lovvalgsbestemmelser';
import {
  konverterUnntakFraBestemmelseTilStegData,
  lagUnntakFraBestemmelse,
} from '../../../regler/unntakfrabestemmelse';

import './vurderingArtikkel16Anmodning.css';

const uuid = require('uuid/v4');

const TidligereMedlemPeriodeLinje = ({
  perm, onChange, checked, redigerbart, feil,
}) => {
  const { periodeID, periode } = perm;
  const label = `Periode: ${formatterDatoTilNorsk(periode.fom)} - ${formatterDatoTilNorsk(periode.tom)}`;

  return (
    <Fragment>
      <Nav.Checkbox feil={feil} disabled={!redigerbart} onChange={() => onChange(periodeID)} label={label} value="something" checked={checked} />
    </Fragment>
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
  onChange = async periodeID => {
    const { fields, oppdaterOgLagreBehandlinger } = this.props;
    const { push, remove } = fields;
    const alleValgtePeriodeID = fields.getAll() || [];
    const eksistererVedPosisjon = alleValgtePeriodeID.findIndex(valgt => valgt === periodeID);

    if (eksistererVedPosisjon === -1) {
      await push(periodeID);
    } else {
      await remove(eksistererVedPosisjon);
    }

    oppdaterOgLagreBehandlinger().catch(e => Utils.logger.error(e));
  };

  render() {
    const {
      medlemskap,
      fields,
      redigerbart,
      feil,
    } = this.props;
    const alleValgtePeriodeID = fields.getAll() || [];
    const { onChange } = this;

    const { perioderMed } = medlemskap;
    return (
      <div>
        {
          perioderMed && perioderMed.map((perm, index) => {
            const isChecked = alleValgtePeriodeID.includes(perm.periodeID);
            return <TidligereMedlemPeriodeLinje feil={feil} redigerbart={redigerbart} onChange={onChange} checked={isChecked} key={uuid()} perm={perm} index={index} />;
          })
        }
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

const TidligereMedlemskap = props => (<div><FieldArray name="tidligeremedlemskap" component={TidligereMedlemskapPerioder} props={props.feil} {...props} /></div>);

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
    fritekstFeilmelding: undefined,
  };

  componentDidMount() {
    const { oppdaterData, tilstand: { art16_1 }, unntakFraBestemmelse } = this.props;
    oppdaterData(konverterTilStegData('art16_1_anmodning', art16_1));
    oppdaterData(konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1));
    oppdaterData(konverterUnntakFraBestemmelseTilStegData(unntakFraBestemmelse));
  }

  componentWillUnmount() {
    this.props.slettData();
  }

  lagreBehandlingerOgBestillAnmodningsperioder = async () => {
    const { oppdaterOgLagreBehandlinger, lagreOgBestillAnmodningsperioder, formValues } = this.props;
    try {
      await oppdaterOgLagreBehandlinger();
      lagreOgBestillAnmodningsperioder(formValues.mottakerinstitusjon);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  vedUnntakFraBestemmelseEndring = async event => {
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
    this.props.lagreVilkarHandler().catch(e => Utils.logger.error(e));
  };

  lagreBehandlinger = () => {
    this.props.oppdaterOgLagreBehandlinger().catch(e => Utils.logger.error(e));
  };

  fritekstEndretHandler = event => {
    this.setState({ fritekstFeilmelding: undefined });

    const { oppdaterData } = this.props;
    const { id, value } = event.target;

    oppdaterData(lagBegrunnelse(id, null, value));
  };

  fritekstFokusFlyttetHandler = () => {
    this.lagreVilkar();
  };

  begrunnelserEndringHandler = async event => {
    this.setState({ begrunnelserFeilmelding: undefined });

    const { oppdaterData } = this.props;
    await oppdaterData(lagBegrunnelse('art16_1_anmodning', [event.target.value]));
    this.lagreVilkar();
  };

  validerUnntakFraBestemmelse = () => {
    const valid = this.props.unntakFraBestemmelse;
    if (!valid) this.setState({ lovvalgFeilmelding: { feilmelding: 'Velg lovvalg' } });
    return valid;
  };

  validerBegrunnelser = () => {
    const { begrunnelseKoder } = this.props.tilstand.art16_1;
    const valid = begrunnelseKoder.length !== 0;
    if (!valid) this.setState({ begrunnelserFeilmelding: 'Velg begrunnelser' });
    return valid;
  };

  validerFritekst = () => {
    const valid = this.props.tilstand.art16_1.begrunnelseFritekst;
    if (!valid) this.setState({ fritekstFeilmelding: { feilmelding: 'Fyll inn fritekst' } });
    return valid;
  };

  validerAlt = () => {
    const { begrunnelseKoder } = this.props.tilstand.art16_1;
    const { touch, formIsValid } = this.props;

    const lovvalgValid = this.validerUnntakFraBestemmelse();
    const begrunnelserValid = this.validerBegrunnelser();
    const fritekstValid = begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN) ? this.validerFritekst() : true;
    touch('mottakerinstitusjon');

    return lovvalgValid && begrunnelserValid && fritekstValid && formIsValid;
  };

  validerOgLagreBehandling = async () => {
    if (this.validerAlt()) {
      await this.byggAnmodningsperioder();
      this.lagreBehandlingerOgBestillAnmodningsperioder();
    }
  };

  render() {
    const {
      anmodningsperiode,
      behandlingID,
      gyldigeSoknadsland,
      medlemskap,
      redigerbart,
      tilstand,
      unntakFraBestemmelse,
      soknadsland,
      formValues,
      form,
    } = this.props;

    const {
      begrunnelserEndringHandler,
      validerAlt,
      validerOgLagreBehandling,
      fritekstFokusFlyttetHandler,
      fritekstEndretHandler,
      vedUnntakFraBestemmelseEndring,
    } = this;

    const {
      begrunnelserFeilmelding,
      fritekstFeilmelding,
      lovvalgFeilmelding,
    } = this.state;

    const antallManeder = datoDiffMenneskelig(anmodningsperiode.fomDato, anmodningsperiode.tomDato);

    const landSomTekstListe = gyldigeSoknadsland.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ');

    const pdfDokumenter = formValues.kreverMottakerinstitusjon ? [
      { navn: 'Forhåndsvis orienteringsbrev til bruker', type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
      { navn: 'Forhåndsvis SED A001', type: EKV.Koder.sedtyper.A001, erSed: true },
    ] : [
      { navn: 'Forhåndsvis orienteringsbrev til bruker', type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
      { navn: 'Forhåndsvis anmodning til utenlandsk myndighet', type: MKV.Koder.brev.produserbaredokumenter.ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.MYNDIGHET } },
    ];

    const { art16_1: { begrunnelseFritekst, begrunnelseKoder }, muligeBegrunnelseValg, erIDirekteTilArtikkel16Flyt } = tilstand;

    const begrunnelseKode = begrunnelseKoder ? begrunnelseKoder[0] : '';

    const visFritekstfelt = begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN);

    const art16fritekst = begrunnelseFritekst || '';

    /* eslint-disable max-len */
    return (
      <div>
        <Nav.typo.Undertittel>Anmodning om unntak etter artikkel 16.1</Nav.typo.Undertittel>
        <div className="artikkel16">
          {
            erIDirekteTilArtikkel16Flyt &&
            <Nav.Row className="vilAnmode">
              <Nav.Column xs="6">
                <Nav.Radio
                  name="vilAnmode"
                  label="Ja, jeg vil anmode om unntak"
                  defaultChecked
                  disabled={!redigerbart}
                />
                <Nav.Radio
                  name="vilAnmode"
                  label="Nei, jeg vil avslå"
                  disabled
                />
              </Nav.Column>
            </Nav.Row>
          }
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
                value={unntakFraBestemmelse || ''}
                disabled={!redigerbart}
                label="Artikkelen det søkes unntak fra:"
                data-cy="unntakArtikkel"
              >
                <option key={uuid()} value="" >Velg...</option>
                { MKV.Kodekombinasjoner.unntaksbestemmelser.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
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
                label="Legg til begrunnelse:"
                data-cy="begrunnelse"
              >
                <option key={uuid()} value="">Velg...</option>
                { muligeBegrunnelseValg.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
              </Nav.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              {
                visFritekstfelt &&
                <Nav.Textarea
                  id="art16_1_anmodning"
                  label="Begrunnelsen kommer ut i vedtaksbrevet som en setning som starter med «Vi har bedt trygdemyndighetene i [land] om en avtale for deg, fordi», og slutter med teksten du har tilføyd."
                  placeholder="Skriv begrunnelsen her. Teksten vil også vises i SED A001, og du bør derfor unngå å bruke direkte tiltale med du/deg/din."
                  disabled={!redigerbart}
                  onBlur={fritekstFokusFlyttetHandler}
                  onChange={fritekstEndretHandler}
                  value={art16fritekst}
                  feil={fritekstFeilmelding}
                  maxLength={255}
                  bredde="fullbredde"
                />
              }
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="12">
              <Nav.Fieldset legend={`Velg direkte forutgående perioder i ${landSomTekstListe}:`}>
                <TidligereMedlemskap oppdaterOgLagreBehandlinger={this.props.oppdaterOgLagreBehandlinger} redigerbart={redigerbart} medlemskap={medlemskap} />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="mottakerinstitusjoner">
            <Nav.Column xs="7">
              <Mottakerinstitusjonvelger
                form={form}
                redigerbart={redigerbart}
                landkode={soknadsland[0]}
                bucType={EKV.Koder.buctyper.legislation.LA_BUC_01}
              />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="6">
              {redigerbart && <PdfLenkeListe vedKlikk={validerAlt} behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Hovedknapp type="hoved" disabled={!redigerbart} onClick={validerOgLagreBehandling}>
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
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  soknadsland: PT.arrayOf(PT.string).isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgKode: PT.string.isRequired,
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
};

VurderingArtikkel16Anmodning.defaultProps = {
  unntakFraBestemmelse: '',
  anmodningsperiode: {},
  formValues: {},
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  unntakFraBestemmelse: anmodningsperioderSelectors.UnntakFraBestemmelseSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  initialValues: {
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    mottakerinstitusjon: '',
    kreverMottakerinstitusjon: false,
  },
});

const VurderingArtikkel16AnmodningForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_ANMODNING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: values => lagYupToReduxformErrorMapper(YupSkjemaer.artikkel16_anmodning)(values),
})(VurderingArtikkel16Anmodning);

export default connect(mapStateToProps)(VurderingArtikkel16AnmodningForm);
