import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../../../proptypes/';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

import './vurderingInngang.css';

class Landfjerning extends Component {
  state = { begrunnelse: '' }

  onChange = event => {
    const { value } = event.currentTarget;
    this.setState({ begrunnelse: value });
  };

  render () {
    const { oppholdBegrunnelser, bekreft, avbryt, landNavn } = this.props;

    return (
      <Nav.Panel border className="oppholdsland__fjerning">
        <Nav.Select value={this.state.begrunnelse} onChange={this.onChange} label={`Velg begrunnelse for fjerning av ${landNavn}`}>
          {oppholdBegrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
        </Nav.Select>
        <div className="oppholdsland__fjerning__knapper">
          <Nav.Knapp mini onClick={() => bekreft(this.state.begrunnelse)}>Bekreft</Nav.Knapp>
          <Nav.Knapp mini onClick={avbryt}>Avbryt</Nav.Knapp>
        </div>
      </Nav.Panel>
    );
  }
};

class OppholdsLandEnkelt extends Component {
  state = { erSlettingIntensjon: false }

  settSlettIntensjon = () => this.setState({ erSlettingIntensjon: true });

  avbryt = () => this.setState({ erSlettingIntensjon: false })

  render () {
    const { landkodeObjekt, bekreftFjern, oppholdBegrunnelser } = this.props;
    const { erSlettingIntensjon } = this.state;
    const { settSlettIntensjon, avbryt } = this;

    return (
      <div>
        <div className="oppholdsland__linje">
          <div className="oppholdsland__landNavn">{kodeverkObjektTilTerm(landkodeObjekt)}</div>
          <div>{!erSlettingIntensjon && <Nav.Knapp mini onClick={settSlettIntensjon} >Fjern</Nav.Knapp> }</div>
        </div>
        {erSlettingIntensjon && <Landfjerning oppholdBegrunnelser={oppholdBegrunnelser} landNavn={kodeverkObjektTilTerm(landkodeObjekt)} bekreft={bekreftFjern} avbryt={avbryt} />}
      </div>
    );
  }
}

class OppholdsLandListe extends Component {

  bekreftFjern = (landKode, begrunnelseKode) => {
    console.log(landKode, begrunnelseKode)
  }

  finnLand = kode => {
    return this.props.landkoder.find(land => land.kode === kode);
  }

  render () {
    const { fields, oppholdBegrunnelser } = this.props;
    const { bekreftFjern } = this;

    const alleOppholdsLand = fields.getAll();
    const gyldigeOppholdsLand = alleOppholdsLand;

    return (
      <div className="vurderingInngang__oppholdsland">
        { gyldigeOppholdsLand.map((land, indeks) => (<OppholdsLandEnkelt key={indeks} landkodeObjekt={this.finnLand(land)} bekreftFjern={bekreftFjern} oppholdBegrunnelser={oppholdBegrunnelser} />))}

      </div>
    );
  }
}

const VurderingInngang = props => {
  const { bekreftOgFortsett, inngangsvilkar, landkoder, begrunnelser } = props;
  const { vurdering } = inngangsvilkar;
  const { opphold: oppholdBegrunnelser } = begrunnelser;

  return (
    <div className="vurderingInngang">
      <Nav.Undertittel>Kontroller inngangsvilkår</Nav.Undertittel>
      <ul className="betingelser__liste">
        <li className="liste__element liste__element--oppfylt">
          { kodeverkObjektTilTerm(vurdering) }
        </li>
        <li className="liste__element liste__element--varsel">
          Sjekk at land er innenfor et territorium / område som dekkes av forordningen.
        </li>
      </ul>
      <div>
        <Nav.Fieldset legend="Land">
          <FieldArray name="oppholdsland" component={OppholdsLandListe} oppholdBegrunnelser={oppholdBegrunnelser} landkoder={landkoder} />
        </Nav.Fieldset>
      </div>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Start behandling</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  faktaavklaring: PT.object.isRequired,
  inngangsvilkar: PT.shape({
    vurdering: MPT.Kodeverk,
  }).isRequired,
};

export default VurderingInngang;
