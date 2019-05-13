/* eslint-disable react/no-multi-comp */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as MPT from '../../../proptypes/';
import * as Utils from '../../../utils';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad/';
import { fagsakSelectors } from '../../../ducks/fagsaker';
import { formSelectors } from '../../../ducks/form';

import { datoDiffMenneskelig, formatterDatoTilNorsk } from '../../../utils/dato';
import DatoOmrade from '../../../komponenter/datoOmrade/datoOmrade';
import PdfLenkeListe from '../../pdfLenkeListe';
import ListevelgerFlervalg from '../../../komponenter/ui/listevelgerFlervalg';

import { konverterTilStegData, lagBegrunnelse } from '../../../regler/vilkar';

import './vurderingArtikkel16.css';

const uuid = require('uuid/v4');

const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.forordning_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.forordning_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tillegg,
];

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

class VurderingArtikkel16 extends Component {
  state = {
    lovvalgFeilmelding: undefined,
    begrunnelserFeilmelding: undefined,
    fritekstFeilmelding: undefined,
  };

  componentDidMount() {
    const { oppdaterData, tilstand: { art16_1 } } = this.props;
    oppdaterData(konverterTilStegData('art16_1', art16_1));
  }

  componentWillUnmount() {
    this.props.slettAllDataForSteg();
  }

  lagreBehandlingerOgFatteVedtak = async behandlingsresultattype => {
    const { oppdaterOgLagreBehandlinger, lagreOgFatteVedtak } = this.props;
    try {
      await oppdaterOgLagreBehandlinger();
      lagreOgFatteVedtak(behandlingsresultattype);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  lagreLovvalgsPerioder = () => {
    this.props.lagreLovvalgsperioderHandler().catch(e => Utils.logger.error(e));
    this.setState({ lovvalgFeilmelding: undefined });
  };

  lagreVilkar = () => {
    this.props.lagreVilkarHandler().catch(e => Utils.logger.error(e));
    this.setState({ begrunnelserFeilmelding: undefined, fritekstFeilmelding: undefined });
  };

  lagreBehandlinger = () => {
    this.props.oppdaterOgLagreBehandlinger().catch(e => Utils.logger.error(e));
  };

  begrunnelserEndringHandler = async event => {
    const { oppdaterData } = this.props;

    await oppdaterData(lagBegrunnelse('art16_1', event.value));
    this.lagreVilkar();
  };

  validerLovvalg = () => {
    const valid = this.props.unntakFraBestemmelse;
    if (!valid) this.setState({ lovvalgFeilmelding: { feilmelding: 'Velg lovvalg' } });
    return valid;
  };

  validerBegrunnelser = () => {
    const { tilstand } = this.props;
    const valid = tilstand.art16_1.begrunnelseKoder.length !== 0;
    if (!valid) this.setState({ begrunnelserFeilmelding: 'Velg begrunnelser' });
    return valid;
  };

  validerFritekst = () => {
    const valid = this.props.art16begrunnelserFritekst !== '';
    if (!valid) this.setState({ fritekstFeilmelding: 'Fyll inn fritekst' });
    return valid;
  };

  validerAlt = () => {
    const { tilstand } = this.props;

    const lovvalgValid = this.validerLovvalg();
    const begrunnelserValid = this.validerBegrunnelser();
    const fritekstValid = tilstand.art16_1.begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN) ? this.validerFritekst() : true;

    return lovvalgValid && begrunnelserValid && fritekstValid;
  };

  validerOgLagreBehandling = () => {
    if (this.validerAlt()) {
      this.lagreBehandlingerOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.ANMODNING_OM_UNNTAK);
    }
  };

  render() {
    const {
      gyldigeSoknadsland,
      soknadsperiode,
      medlemskap,
      oppsummering,
      redigerbart,
      tilstand,
    } = this.props;

    const {
      begrunnelserEndringHandler,
      lagreLovvalgsPerioder,
      lagreVilkar,
      validerAlt,
      validerOgLagreBehandling,
    } = this;

    const {
      begrunnelserFeilmelding,
      fritekstFeilmelding,
      lovvalgFeilmelding,
    } = this.state;

    const { behandlingID } = oppsummering;

    const antallManeder = datoDiffMenneskelig(soknadsperiode.fom, soknadsperiode.tom);

    const landSomTekstListe = gyldigeSoknadsland.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ');

    const dokumenter = [
      { navn: 'Forhåndsvis orienteringsbrev til bruker', type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.BRUKER } },
      { navn: 'Forhåndsvis anmodning til utenlandsk myndighet', type: MKV.Koder.brev.produserbaredokumenter.ANMODNING_UNNTAK, data: { mottaker: MKV.Koder.aktoersroller.MYNDIGHET } },
    ];

    const fritekstError = fritekstFeilmelding ? { error: fritekstFeilmelding, touched: true } : {};

    const visFritekstfelt = tilstand.art16_1.begrunnelseKoder.includes(MKV.Koder.begrunnelser.art16_1_anmodning.SAERLIG_GRUNN);

    const { art16_1 } = tilstand;

    /* eslint-disable max-len */
    return (
      <div>
        <Nav.Undertittel>Anmodning om unntak etter artikkel 16.1</Nav.Undertittel>
        <div className="artikkel16">
          <Nav.Row className="artikkel16__ekstratopp">
            <Nav.Column xs="6">
              <Nav.Element type="element">Lands lovgivning det søkes unntak fra:</Nav.Element>
              <Nav.Normaltekst>{landSomTekstListe}</Nav.Normaltekst>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.Element type="element">Antall måneder:</Nav.Element>
              <Nav.Normaltekst>{antallManeder}</Nav.Normaltekst>
              <DatoOmrade periode={soknadsperiode} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              <Skjema.Select
                feil={lovvalgFeilmelding}
                onBlur={lagreLovvalgsPerioder}
                disabled={!redigerbart}
                feltNavn="lovvalgsperiode.unntakFraBestemmelse"
                label="Artikkelen det søkes unntak fra:"
              >
                { alleLovvalg.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="7">
              <ListevelgerFlervalg
                disabled={!redigerbart}
                feil={begrunnelserFeilmelding}
                muligeValg={MKV.KTObjects.begrunnelser.art16_1_anmodning}
                tillatFritekst={false}
                label="Legg til begrunnelse:"
                onChange={begrunnelserEndringHandler}
                defaultElementer={art16_1.begrunnelseKoder}
              />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              {
                visFritekstfelt &&
                <Skjema.Textarea
                  meta={fritekstError}
                  onBlur={lagreVilkar}
                  disabled={!redigerbart}
                  feltNavn="vilkar.art16_1_begrunnelser_fritekst"
                  label="Begrunnelse til utenlandsk myndighet (engelsk):"
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
          <Nav.Row>
            <Nav.Column xs="6">
              {redigerbart && <PdfLenkeListe vedKlikk={validerAlt} behandlingID={behandlingID} dokumenter={dokumenter} />}
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

VurderingArtikkel16.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  gyldigeSoknadsland: MPT.Soknadsland.isRequired, // TODO:
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  oppsummering: PT.object.isRequired,
  lovvalgKode: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterOgLagreBehandlinger: PT.func.isRequired,
  unntakFraBestemmelse: PT.string,
  art16begrunnelserFritekst: PT.string,
  lagreVilkarHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
  tilstand: PT.object.isRequired,
};

VurderingArtikkel16.defaultProps = {
  art16begrunnelserFritekst: '',
  unntakFraBestemmelse: '',
};

const mapStateToProps = state => ({
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  lovvalgKode: avklartefaktaSelectors.AvklartefaktaLovvalgKodeSelector(state),
  soknadsperiode: soknadSelectors.SoknadsperiodeSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
  art16begrunnelserFritekst: formSelectors.Art16BegrunnelseFritekstSelector(state),
  unntakFraBestemmelse: formSelectors.UnntakFraBestemmelse(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16);
