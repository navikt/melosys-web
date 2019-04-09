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
const VirksomheterLinje = props => {
  const {
    virksomheten, erValgt, virksomhetKlikkHandler, redigerbart,
  } = props;

  return (
    <div className="arbeidsgiver__enkeltlinje">
      <Nav.Checkbox disabled={!redigerbart} checked={erValgt} onChange={() => virksomhetKlikkHandler(virksomheten.orgnr)} label={`${virksomheten.navn}`} />
    </div>
  );
};

VirksomheterLinje.propTypes = {
  virksomhetKlikkHandler: PT.func.isRequired,
  virksomheten: MPT.Organisasjon.isRequired,
  erValgt: PT.bool,
  redigerbart: PT.bool.isRequired,
};

VirksomheterLinje.defaultProps = {
  erValgt: false,
};

/**
 * FieldArray trenger en egen komponent-container for å rendre ut hvert enkelt felt som er lagret i store (dvs avkryssede arbeidsgivere).
 * Rendre ut ALLE arbeidsgiver. og kryss av de som samsvarer med orgnr.
 *
 *
 * @param props Objekt Diverse props Se prop types
 */
class VirksomheterListe extends Component {
  virksomhetKlikkHandler = orgnr => {
    const { fields } = this.props;
    const alleOpprinneligValgte = fields.getAll() || [];
    const indexPosition = alleOpprinneligValgte.findIndex(enkeltFakta => enkeltFakta.subjektID === orgnr);
    const avklartfakta = { ...alleOpprinneligValgte[indexPosition] };

    const virksomhetErValgt = avklartfakta.fakta.includes('TRUE') ? 'FALSE' : 'TRUE';
    fields.push({ ...avklartfakta, fakta: [virksomhetErValgt] });

    return indexPosition >= 0 ? fields.remove(indexPosition) : fields.push(orgnr);
  };

  render() {
    const { fields, virksomheterIPerioden, redigerbart } = this.props;
    const alleAvklartefakta = fields.getAll();

    const ingenVirksomheterVarsel = alleAvklartefakta.length === 0 && (
      <Nav.AlertStripe type="advarsel">Finner ingen arbeidsgivere, selvsetendig næringsdrivende eller frilansere fra saksopplysninger.</Nav.AlertStripe>
    );

    return (
      <div>
        {virksomheterIPerioden.map(virksomheten => {
          const avklartfaktaForVirksomhet = alleAvklartefakta.find(enkeltAvklaring => enkeltAvklaring.subjektID === virksomheten.orgnr);
          const virksomhetErValgt = avklartfaktaForVirksomhet.fakta.includes('TRUE');

          return <VirksomheterLinje
            virksomheten={virksomheten}
            erValgt={virksomhetErValgt}
            key={uuid()}
            virksomhetKlikkHandler={this.virksomhetKlikkHandler}
            redigerbart={redigerbart}
          />;
        })
        }
        {ingenVirksomheterVarsel}
      </div>
    );
  }
}

VirksomheterListe.propTypes = {
  fields: PT.object.isRequired,
  virksomheterIPerioden: PT.array,
  redigerbart: PT.bool.isRequired,

};

VirksomheterListe.defaultProps = {
  virksomheterIPerioden: [],
};

/**
 * Dette er hovedkomponenten for fanen "Velg Arbeidsgiver". Denne trekker inn ArbeidsgiverListe som er den egentlige utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger en arbeidsgiver.
 *
 * @param props
 */
const VurderingVirksomhet = props => {
  const {
    bekreftOgFortsett, virksomheterIPerioden, tilstand, redigerbart,
  } = props;
  const { harAvklaring } = tilstand;

  return (
    <div className="vurderingArbeidsgiver">
      <Nav.Undertittel>Velg arbeidsgiver, oppdragsgiver eller selvstendig næringsvirksomhet:</Nav.Undertittel>
      <div className="arbeidsgiver">
        <FieldArray name="avklartefakta.virksomheter" component={arrayProps => <VirksomheterListe {...arrayProps} redigerbart={redigerbart} virksomheterIPerioden={virksomheterIPerioden} />} />
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool,
  }).isRequired,
  virksomheterIPerioden: MPT.Organisasjoner.isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingVirksomhet;
