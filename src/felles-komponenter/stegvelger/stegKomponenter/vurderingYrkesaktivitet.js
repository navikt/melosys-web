import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingYrkesaktivitetTyper = {
  ID: 'YRKESAKTIVITET',
  ORDINAER_ARBEIDSTAKER: 'ORDINAER_ARBEIDSTAKER',
  SELVSTENDIG_NAERINGSDRIVENDE: 'SELVSTENDIG_NAERINGSDRIVENDE',
  ORDINAER_OG_SELVSTENDIG: 'ORDINAER_OG_SELVSTENDIG',
  TJENESTEPERSON_NORSK_STATSFORVANTLING: 'TJENESTEPERSON_NORSK_STATSFORVANTLING',
};

const VurderingYrkesaktivitet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesaktivitet</Nav.Undertittel>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitet" value={VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER} label="Ordinær arbeidstaker" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitet" value={VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE} label="Selvstendig næringsdrivende" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitet" value={VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG} label="Ordinær arbeidstaker og selvstendig næringsdrivende" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitet" value={VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING} label="Tjenesteperson i norsk statsforvaltning" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesaktivitet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingYrkesaktivitet.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitet;
