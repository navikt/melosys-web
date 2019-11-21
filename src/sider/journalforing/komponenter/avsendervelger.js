import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';
import MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { journalforingSelectors } from '../../../ducks/journalforing';
import PreutfyltAvsender from './preutfyltAvsender';

import './avsendervelger.css';

const clsBehandlingsPanel = {
  background: 'lightgray',
  border: '1px solid #b7b1a9',
  borderRadius: '3px',
  margin: '0.5em 0.5em 0.5em 1.5em',
  padding: '0.25em 1.25em 0 1.25em',
};

const AvsenderOrganisasjon = () => (
  <div style={clsBehandlingsPanel}>
    <Skjema.Input
      feltNavn="avsenderID"
      label="Oppgi avsenders org.nr.:"
      placeholder="Skriv inn..."
    />
    <Nav.typo.Element>Avsender firmanavn</Nav.typo.Element>
    <p>TODO; Lookup</p>
  </div>
);
const AvsenderUtenlanskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode, fullmektigLandEndret,
}) => (
  <div style={clsBehandlingsPanel}>
    <Skjema.LandVelger feltNavn="utenlandskTrygdemyndighetLandkode" label="Velg land" onChange={fullmektigLandEndret} />
    {
      utenlandskTrygdemyndighetLandkode &&
      <Fragment>
        <Nav.typo.Element>Avsender</Nav.typo.Element>
        <Nav.typo.Normaltekst>Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, MKV.KTObjects.landkoder)}</Nav.typo.Normaltekst>
      </Fragment>
    }
  </div>
);

AvsenderUtenlanskTrygdemyndighet.propTypes = {
  utenlandskTrygdemyndighetLandkode: PT.string,
  fullmektigLandEndret: PT.func.isRequired,
};
AvsenderUtenlanskTrygdemyndighet.defaultProps = {
  utenlandskTrygdemyndighetLandkode: '',
};
const AvsenderAnnet = () => (
  <div style={clsBehandlingsPanel}>
    <Skjema.Input
      feltNavn="avsenderNavn"
      label="Oppgi avsenders navn"
      placeholder="Skriv inn..."
    />
  </div>
);
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
    if (erAvsenderPreutfylt) return;

    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case 'FULLMEKTIG':
      case 'ARBEIDSGIVER':
      case 'ARBEIDSGIVER_FULLMEKTIG':
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
          label="Fullmektig"
          value="FULLMEKTIG"
        />
        {
          formValues.avsenderType === 'FULLMEKTIG' &&
          <Fragment>
            <AvsenderOrganisasjon />
          </Fragment>
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver"
          value="ARBEIDSGIVER"
        />
        {
          formValues.avsenderType === 'ARBEIDSGIVER' &&
          <Fragment>
            <AvsenderOrganisasjon />
          </Fragment>
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver som er fullmektig"
          value="ARBEIDSGIVER_FULLMEKTIG"
        />
        {
          formValues.avsenderType === 'ARBEIDSGIVER_FULLMEKTIG' &&
          <Fragment>
            <AvsenderOrganisasjon />
          </Fragment>
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Utenlandsk trygdemyndighet"
          value={MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET}
        />
        {
          formValues.avsenderType === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET &&
          <Fragment>
            <AvsenderUtenlanskTrygdemyndighet
              utenlandskTrygdemyndighetLandkode={formValues.utenlandskTrygdemyndighetLandkode}
              fullmektigLandEndret={fullmektigLandEndret}
            />
          </Fragment>
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Annet"
          value={MKV.Koder.avsendertyper.ORGANISASJON}
        />
        {
          formValues.avsenderType === MKV.Koder.avsendertyper.ORGANISASJON &&
          <Fragment>
            <AvsenderAnnet />
          </Fragment>
        }
      </Skjema.RadioGruppe>
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
