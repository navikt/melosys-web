import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';
import * as Api from '../../../../services/api';
import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';
import * as RegistreringContext from '../state/registreringContext';
import ListevelgerFlervalg from '../../../../felleskomponenter/ui/listevelgerFlervalg';
import Medlemskap from '../../../../felleskomponenter/medlemskap';

import { lovvalgsperioderOperations } from '../../../../ducks/lovvalgsperioder';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../../ducks/avklartefakta';

import { createValidator } from '../../../../felleskomponenter/skjema/validering/skjemaer/createValidator';

import './saksopplysninger.css';

const uuid = require('uuid/v4');

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.unntak_periode_begrunnelser);
};

const RegisterkontrollTreff = ({ begrunnelseKode }) => (
  <div className="registerkontroll-listeelement">
    <Nav.Ikoner kind="advarsel-sirkel-fyll" size="24" />
    <Nav.Normaltekst>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.Normaltekst>
  </div>
);

RegisterkontrollTreff.propTypes = {
  begrunnelseKode: PT.string.isRequired,
};

class Saksopplysninger extends Component {
  state = {
    unntaksperiodeVurdering: KV.Koder.Unntaksperiode.GODKJENT,
    begrunnelseFritekst: '',
    ikkeGodkjentBegrunnelseKoder: [],
    // endrePeriodeFeilmeldinger: { fom: undefined, tom: undefined, fritekst: undefined },
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };
  textAreaOnChange = event => {
    const begrunnelseFritekst = event.target.value;
    this.setState({ begrunnelseFritekst });
  };
  submitRegistrering = () => {
    if (!this.validerFelt()) {
      return false;
    }

    const { behandlingID, history } = this.props;
    const tilForsiden = () => history.push('/');
    switch (this.state.unntaksperiodeVurdering) {
      case KV.Koder.Unntaksperiode.GODKJENT:
        this.godkjenn(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.INNHENT:
        this.innhentInfo(behandlingID)
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      case KV.Koder.Unntaksperiode.AVSLAG: {
        const ikkegodkjenn = {
          ikkeGodkjentBegrunnelseKoder: [...this.state.ikkeGodkjentBegrunnelseKoder],
          begrunnelseFritekst: this.state.begrunnelseFritekst,
        };
        Api.Saksflyt.Unntaksperioder.ikkegodkjenn(behandlingID, { ...ikkegodkjenn })
          .then(tilForsiden)
          .catch(Utils.logger.error);
        return true;
      }
      default:
        return false;
    }
  };
  render() {
    const {
      medlemskap, sed, vurderingBegrunnelser, redigerbart,
    } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }

    const listevalgEndringHandler = event => {
      const ikkeGodkjentBegrunnelseKoder = [...event.value];
      this.setState({ ikkeGodkjentBegrunnelseKoder });
    };
    const unikRadioButtonGruppeID = uuid();
    return (
      <div>
        <form name="anmodningunntak" id="anmodningunntak" onSubmit={this.overstyrSubmit}>
          <div className="stegvelger panelSeksjon">
            <div className="panel stegFane steg0 stegFane--aktiv">
              <Nav.Systemtittel>Behandle anmoding om unntak</Nav.Systemtittel>
              <br />
              <div className="vurderUnntaksperiode">
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Nav.Element>Treff ved automatisk kontroll</Nav.Element>
                    {vurderingBegrunnelser.begrunnelseKoder && vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode =>
                      <RegisterkontrollTreff key={uuid()} begrunnelseKode={begrunnelseKode} />)}
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row className="seksjon">
                  <Nav.Column xs="12">
                    <Nav.Fieldset legend="Vurder unntaksperiode" onChange={e => this.setState({ unntaksperiodeVurdering: e.target.value })} disabled={!redigerbart}>
                      <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.GODKJENT} label="Godkjenn" defaultChecked />
                      <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.INNHENT} label="Innhent informasjon" />
                      <Nav.Radio name={unikRadioButtonGruppeID} value={KV.Koder.Unntaksperiode.AVSLAG} label="Ikke godkjenn" />
                    </Nav.Fieldset>
                  </Nav.Column>
                </Nav.Row>
                {this.state.unntaksperiodeVurdering === KV.Koder.Unntaksperiode.AVSLAG && (
                  <Fragment>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        <Nav.Fieldset legend="Begrunnelse for ikke godkjent unntaksperiode">
                          <ListevelgerFlervalg
                            disabled={false}
                            muligeValg={MKV.KTObjects.begrunnelser.ikke_godkjent_begrunnelser}
                            label="Legg til begrunnelse for ikke oppfylt:"
                            tillatFritekst={false}
                            onChange={listevalgEndringHandler}
                          />
                        </Nav.Fieldset>
                      </Nav.Column>
                    </Nav.Row>
                    <Nav.Row>
                      <Nav.Column xs="6">
                        {this.state.ikkeGodkjentBegrunnelseKoder.includes('ANNET') &&
                        <Nav.Textarea
                          label="Skriv inn begrunnelse for avslaget..."
                          onChange={this.textAreaOnChange}
                          value={this.state.begrunnelseFritekst}
                          maxLength={255}
                          bredde="fullbredde" />
                        }
                      </Nav.Column>
                    </Nav.Row>
                  </Fragment>
                )}
                <Nav.Row className="seksjon">
                  <Nav.Column xs="3">
                    <Nav.Hovedknapp onClick={() => this.submitRegistrering()} disabled={!redigerbart}>Bekreft og fortsett</Nav.Hovedknapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}


Saksopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: PT.object, // TODO prop-type
  vurderingBegrunnelser: PT.object,
  skjema: PT.any,
  avklartefakta: PT.array.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  vurderingBegrunnelser: {},
  sed: {},
  skjema: {},
};

const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
});
const mapDispatchToProps = dispatch => ({
  oppdaterAvklartefakta: (behandlingID, avklartefaktaListe) => dispatch(avklartefaktaOperations.send(behandlingID, avklartefaktaListe)),
});

export default withRouter(RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
