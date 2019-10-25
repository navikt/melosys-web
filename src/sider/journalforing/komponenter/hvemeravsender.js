import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';
import MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

const HvemErAvsender = ({
  className,
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  visAvsenderSpinner,
}) => {
  const avsenderTypeEndret = e => {
    const avsender = e.target.value;

    switch (avsender) {
      case KV.Koder.Avsendere.BRUKER: {
        kopierBrukerTilAvsender();
        break;
      }
      case KV.Koder.Avsendere.ARBEIDSGIVER_ELLER_FULLMEKTIG:
      case KV.Koder.Avsendere.UTENLANDSK_TRYGDEMYNDIGHET: {
        tomAvsender();
        break;
      }
      default:
        throw new Error('avsender må finnes blant avsendere-konstanter');
    }
  };

  const fullmektigLandEndret = (landkode = '') => {
    const avsenderNavn = landkode ? `Trygdemyndighet i ${KV.kodeTilTerm(landkode, MKV.KTObjects.landkoder)}` : '';

    settFeltInnhold('avsenderID', landkode);
    settFeltInnhold('avsenderNavn', avsenderNavn);
  };

  return (
    <div className={className}>
      <Nav.Fieldset legend="Hvem er avsender?" onChange={avsenderTypeEndret}>
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Bruker"
          value={KV.Koder.Avsendere.BRUKER}
        />
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver/fullmektig"
          value={KV.Koder.Avsendere.ARBEIDSGIVER_ELLER_FULLMEKTIG}
        />
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Utenlandsk trygdemyndighet"
          value={KV.Koder.Avsendere.UTENLANDSK_TRYGDEMYNDIGHET}
        />
      </Nav.Fieldset>
      {
        formValues.avsenderType === KV.Koder.Avsendere.ARBEIDSGIVER_ELLER_FULLMEKTIG &&
        <Fragment>
          <Skjema.Input
            feltNavn="avsenderID"
            label="Oppgi avsenders org.nr.:"
            placeholder="Skriv inn..."
          />
          {
            formValues.avsenderNavn &&
            <Fragment>
              <Nav.Element>Avsenders firmanavn</Nav.Element>
              <Nav.Normaltekst>{formValues.avsenderNavn}{visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" />}</Nav.Normaltekst>
            </Fragment>
          }
        </Fragment>
      }
      {
        formValues.avsenderType === KV.Koder.Avsendere.UTENLANDSK_TRYGDEMYNDIGHET &&
        <Fragment>
          <Skjema.LandVelger feltNavn="utenlandskTrygdemyndighetLandkode" label="Velg land" onChange={fullmektigLandEndret} />
          {
            formValues.utenlandskTrygdemyndighetLandkode &&
            <Fragment>
              <Nav.Element>Avsender</Nav.Element>
              <Nav.Normaltekst>Trygdemyndighet i {KV.kodeTilTerm(formValues.utenlandskTrygdemyndighetLandkode, MKV.KTObjects.landkoder)}</Nav.Normaltekst>
            </Fragment>
          }
        </Fragment>
      }
    </div>
  );
};

HvemErAvsender.propTypes = {
  className: PT.string,
  kopierBrukerTilAvsender: PT.func.isRequired,
  tomAvsender: PT.func.isRequired,
  formValues: PT.object,
  settFeltInnhold: PT.func.isRequired,
  visAvsenderSpinner: PT.bool.isRequired,
};

HvemErAvsender.defaultProps = {
  className: undefined,
  formValues: {},
};

const mapStateToProps = state => ({
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
});

export default connect(mapStateToProps)(HvemErAvsender);
