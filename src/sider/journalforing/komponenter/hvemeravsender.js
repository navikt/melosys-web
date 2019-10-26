import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';
import MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { journalforingSelectors } from '../../../ducks/journalforing';

import './hvemeravsender.css';

const PreutfyltAvsender = ({
  className,
  avsenderID,
  avsenderNavn,
}) => (
  <div className={className}>
    <Nav.Element className="linje">Avsender ID</Nav.Element>
    <Nav.Normaltekst className="linje">{avsenderID}</Nav.Normaltekst>
    <Nav.Element className="linje">Avsenders navn</Nav.Element>
    <Nav.Normaltekst className="linje">{avsenderNavn}</Nav.Normaltekst>
  </div>
);

PreutfyltAvsender.propTypes = {
  className: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  avsenderNavn: PT.string.isRequired,
};

const HvemErAvsender = ({
  className,
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  visAvsenderSpinner,
  journalforingAvsenderID,
  journalforingAvsenderNavn,
}) => {
  const avsenderTypeEndret = avsenderType => {
    switch (avsenderType) {
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

  useEffect(() => {
    if (formValues.avsenderType) avsenderTypeEndret(formValues.avsenderType);
  }, [formValues.avsenderType]);

  const fullmektigLandEndret = (landkode = '') => {
    const avsenderNavn = landkode ? `Trygdemyndighet i ${KV.kodeTilTerm(landkode, MKV.KTObjects.landkoder)}` : '';

    settFeltInnhold('avsenderID', landkode);
    settFeltInnhold('avsenderNavn', avsenderNavn);
  };

  if (journalforingAvsenderID && journalforingAvsenderNavn) {
    return (
      <PreutfyltAvsender
        className={className}
        avsenderID={journalforingAvsenderID}
        avsenderNavn={journalforingAvsenderNavn}
      />
    );
  }

  return (
    <div className={className}>
      <Skjema.RadioGruppe feltNavn="avsenderType" label="Hvem er avsender?">
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
      </Skjema.RadioGruppe>
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
  journalforingAvsenderID: PT.string,
  journalforingAvsenderNavn: PT.string,
};

HvemErAvsender.defaultProps = {
  className: undefined,
  formValues: {},
  journalforingAvsenderID: undefined,
  journalforingAvsenderNavn: undefined,
};

const mapStateToProps = state => ({
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  journalforingAvsenderID: journalforingSelectors.AvsenderIDSelector(state),
  journalforingAvsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
});

export default connect(mapStateToProps)(HvemErAvsender);
