import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './vurderingArbeidsgiver.css';

const uuid = require('uuid/v4');

/**
 * Enkeltsjekkboks for ett arbeidsgiver.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const ArbeidsgiverLinje = props => {
  const { arbeidsgiveren, erValgt, arbeidsgiverKlikkHandler } = props;

  return (
    <div className="arbeidsgiver__enkeltlinje">
      <Nav.Checkbox checked={erValgt} onChange={() => arbeidsgiverKlikkHandler(arbeidsgiveren.orgnr)} label={`${arbeidsgiveren.navn}`} />
    </div>
  );
};

ArbeidsgiverLinje.propTypes = {
  arbeidsgiverKlikkHandler: PT.func.isRequired,
  arbeidsgiveren: MPT.Organisasjon.isRequired,
  erValgt: PT.bool,
};

ArbeidsgiverLinje.defaultProps = {
  erValgt: false,
};

/**
 * FieldArray trenger en egen komponent-container for å rendre ut hvert enkelt felt som er lagret i store (dvs avkryssede arbeidsgivere).
 * Rendre ut ALLE arbeidsgiver. og kryss av de som samsvarer med orgnr.
 *
 *
 * @param props Objekt Diverse props Se prop types
 */
class ArbeidsgivereListe extends Component {
  arbeidsgiverKlikkHandler = orgnr => {
    const { fields } = this.props;
    const alleOpprinneligValgte = fields.getAll() || [];
    const indexPosition = alleOpprinneligValgte.findIndex(enkeltFakta => enkeltFakta.subjektID === orgnr);
    const avklartfakta = { ...alleOpprinneligValgte[indexPosition] };

    const arbeidsgiverErValgt = avklartfakta.fakta.includes('TRUE') ? 'FALSE' : 'TRUE';
    fields.push({ ...avklartfakta, fakta: [arbeidsgiverErValgt] });

    return indexPosition >= 0 ? fields.remove(indexPosition) : fields.push(orgnr);
  };

  render() {
    const { fields, arbeidsgivereIPerioden } = this.props;
    const alleAvklartefakta = fields.getAll();

    const ingenArbeidsgivereVarsel = alleAvklartefakta.length === 0 && (
      <Nav.AlertStripe type="advarsel">Finner ingen arbeidsgivere hvor søker har arbeidsforhold innenfor den angitte søknadsperioden.</Nav.AlertStripe>
    );

    return (
      <div>
        {arbeidsgivereIPerioden.map(arbeidsgiveren => {
          const avklartfaktaForArbeidsgiver = alleAvklartefakta.find(enkeltAvklaring => enkeltAvklaring.subjektID === arbeidsgiveren.orgnr);
          const arbeidsGiverErValgt = avklartfaktaForArbeidsgiver.fakta.includes('TRUE');

          return <ArbeidsgiverLinje
            arbeidsgiveren={arbeidsgiveren}
            erValgt={arbeidsGiverErValgt}
            key={uuid()}
            arbeidsgiverKlikkHandler={this.arbeidsgiverKlikkHandler}
          />;
        })
        }
        {ingenArbeidsgivereVarsel}
      </div>
    );
  }
}

ArbeidsgivereListe.propTypes = {
  fields: PT.object.isRequired,
  arbeidsgivereIPerioden: PT.array,
};

ArbeidsgivereListe.defaultProps = {
  arbeidsgivereIPerioden: [],
};

/**
 * Dette er hovedkomponenten for fanen "Velg Arbeidsgiver". Denne trekker inn ArbeidsgiverListe som er den egentlige utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger en arbeidsgiver.
 *
 * @param props
 */
const VurderingArbeidsgiver = props => {
  const { bekreftOgFortsett, arbeidsgivereIPerioden } = props;

  return (
    <div className="vurderingArbeidsgiver">
      <Nav.Undertittel>Velg arbeidsgiver, oppdragsgiver eller selvstendig næringsvirksomhet:</Nav.Undertittel>
      <div className="arbeidsgiver">
        <FieldArray name="avklartefakta.arbeidsgivere" component={arrayProps => <ArbeidsgivereListe {...arrayProps} arbeidsgivereIPerioden={arbeidsgivereIPerioden} />} />
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingArbeidsgiver.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  arbeidsgivereIPerioden: MPT.Organisasjoner.isRequired,
};

export default VurderingArbeidsgiver;
