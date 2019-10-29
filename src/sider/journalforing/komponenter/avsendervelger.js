import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';
import MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { journalforingSelectors } from '../../../ducks/journalforing';

import './avsendervelger.css';

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

const AvsenderVelger = ({
  className,
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  visAvsenderSpinner,
  journalforingAvsenderID,
  journalforingAvsenderNavn,
  erAvsenderPreutfylt,
}) => {
  const avsenderTypeEndret = avsenderType => {
    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case MKV.Koder.avsendertyper.ORGANISASJON:
      case MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET: {
        tomAvsender();
        break;
      }
      default:
        throw new Error('Ukjent avsenderType');
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

  if (erAvsenderPreutfylt) {
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
          value={MKV.Koder.avsendertyper.PERSON}
        />
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver/fullmektig"
          value={MKV.Koder.avsendertyper.ORGANISASJON}
        />
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Utenlandsk trygdemyndighet"
          value={MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET}
        />
      </Skjema.RadioGruppe>
      {
        formValues.avsenderType === MKV.Koder.avsendertyper.ORGANISASJON &&
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
        formValues.avsenderType === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET &&
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

AvsenderVelger.propTypes = {
  className: PT.string,
  kopierBrukerTilAvsender: PT.func.isRequired,
  tomAvsender: PT.func.isRequired,
  formValues: PT.object,
  settFeltInnhold: PT.func.isRequired,
  visAvsenderSpinner: PT.bool,
  journalforingAvsenderID: PT.string,
  journalforingAvsenderNavn: PT.string,
  erAvsenderPreutfylt: PT.bool.isRequired,
};

AvsenderVelger.defaultProps = {
  className: undefined,
  formValues: {},
  journalforingAvsenderID: undefined,
  journalforingAvsenderNavn: undefined,
  visAvsenderSpinner: false,
};

const mapStateToProps = state => ({
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  journalforingAvsenderID: journalforingSelectors.AvsenderIDSelector(state),
  journalforingAvsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
  erAvsenderPreutfylt: journalforingSelectors.ErAvsenderPreutfyltSelector(state),
});

export default connect(mapStateToProps)(AvsenderVelger);
