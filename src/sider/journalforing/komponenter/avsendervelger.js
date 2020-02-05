import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import PT from 'prop-types';
import MKV from '../../../melosyskodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as KV from '../../../kodeverk';
import { journalforingSelectors } from '../../../ducks/journalforing';

import { AvsenderOrganisasjon, AvsenderUtenlanskTrygdemyndighet, AvsenderFullmektig } from './avsendere';
import './avsendervelger.css';

const AvsenderVelger = ({
  className,
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  hentOgVisRepresentant,
  erAvsenderPreutfylt,
}) => {
  useEffect(() => {
    if (erAvsenderPreutfylt) {
      settFeltInnhold('avsenderType', MKV.Koder.avsendertyper.PERSON);
    }
  }, [erAvsenderPreutfylt]);

  const avsenderTypeEndret = avsenderType => {
    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case KV.AvsenderTyper.ANNET:
      case KV.AvsenderTyper.FULLMEKTIG:
      case KV.AvsenderTyper.ARBEIDSGIVER:
      case KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG:
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
          value={KV.AvsenderTyper.FULLMEKTIG}
        />
        {
          formValues.avsenderType === KV.AvsenderTyper.FULLMEKTIG &&
          <AvsenderFullmektig
            avsenderID={formValues.avsenderID}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver"
          value={KV.AvsenderTyper.ARBEIDSGIVER}
        />
        {
          formValues.avsenderType === KV.AvsenderTyper.ARBEIDSGIVER &&
          <AvsenderOrganisasjon
            avsenderID={formValues.avsenderID}
            avsenderType={formValues.avsenderType}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver som er fullmektig"
          value={KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG}
        />
        {
          formValues.avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG &&
          <AvsenderOrganisasjon
            avsenderID={formValues.avsenderID}
            avsenderType={formValues.avsenderType}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        }
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Utenlandsk trygdemyndighet"
          value={MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET}
        />
        {
          formValues.avsenderType === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET &&
          <AvsenderUtenlanskTrygdemyndighet
            utenlandskTrygdemyndighetLandkode={formValues.utenlandskTrygdemyndighetLandkode}
            fullmektigLandEndret={fullmektigLandEndret}
          />
        }
        {/* TODO: Legges inn igjen i SPRINT-41 (etter endringer er avklart hos fag)
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Annet"
          value="ANNET"
        />
        {
          formValues.avsenderType === 'ANNET' &&
          <Fragment>
            <AvsenderAnnet />
          </Fragment>
        }
        */}
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
  hentOgVisRepresentant: PT.func.isRequired,
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
