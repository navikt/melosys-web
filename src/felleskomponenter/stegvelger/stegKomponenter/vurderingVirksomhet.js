import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import { konverterTilStegData, lagAvklartfakta, slettAvklartfakta } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';

import './vurderingArbeidsgiver.css';

/**
 * Enkeltsjekkboks for ett arbeidsgiver.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const VirksomheterLinje = props => {
  const {
    virksomheten, avklartVirksomhet, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.VIRKSOMHET, avklartVirksomhet));

    const cleanup = () => {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET));
    };
    return cleanup;
  }, []);

  const virksomhetErValgt = avklartVirksomhet && avklartVirksomhet.fakta.includes('TRUE');

  const virksomhetKlikkHandler = () => {
    const verdi = virksomhetErValgt ? 'FALSE' : 'TRUE';
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET, virksomheten.virksomhetId, verdi));
  };

  return (
    <div className="arbeidsgiver__enkeltlinje">
      <Nav.Checkbox disabled={!redigerbart} checked={virksomhetErValgt === true} onChange={virksomhetKlikkHandler} label={`${virksomheten.navn}`} />
    </div>
  );
};

VirksomheterLinje.propTypes = {
  virksomheten: MPT.Virksomhet.isRequired,
  avklartVirksomhet: MPT.Avklartefakta,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VirksomheterLinje.defaultProps = {
  avklartVirksomhet: null,
};

/**
 * FieldArray trenger en egen komponent-container for å rendre ut hvert enkelt felt som er lagret i store (dvs avkryssede arbeidsgivere).
 * Rendre ut ALLE arbeidsgiver. og kryss av de som samsvarer med orgnr.
 *
 *
 * @param props Objekt Diverse props Se prop types
 */
const VirksomheterListe = props => {
  const {
    virksomheterIPerioden, redigerbart, avklarteVirksomheter, oppdaterData, slettData,
  } = props;

  const ingenVirksomheterVarsel = virksomheterIPerioden.length === 0 && (
    <Nav.AlertStripe type="advarsel">Finner ingen arbeidsgivere, selvstendig næringsdrivende eller frilansere fra saksopplysninger.</Nav.AlertStripe>
  );

  return (
    <div>
      {virksomheterIPerioden.map(virksomheten => {
        const avklartfaktaForVirksomhet = avklarteVirksomheter.find(enkeltAvklaring => enkeltAvklaring.subjektID === virksomheten.virksomhetId);

        const key = `avklartVirksomhet${virksomheten.virksomhetId}`;
        return <VirksomheterLinje
          virksomheten={virksomheten}
          avklartVirksomhet={avklartfaktaForVirksomhet}
          key={key}
          redigerbart={redigerbart}
          oppdaterData={oppdaterData}
          slettData={slettData}
        />;
      })
      }
      {ingenVirksomheterVarsel}
    </div>
  );
};

VirksomheterListe.propTypes = {
  virksomheterIPerioden: PT.arrayOf(MPT.Virksomhet),
  avklarteVirksomheter: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VirksomheterListe.defaultProps = {
  virksomheterIPerioden: [],
  avklarteVirksomheter: [],
};

/**
 * Dette er hovedkomponenten for fanen "Velg Arbeidsgiver". Denne trekker inn ArbeidsgiverListe som er den egentlige utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger en arbeidsgiver.
 *
 * @param props
 */
const VurderingVirksomhet = props => {
  const {
    bekreftOgFortsett, virksomheterIPerioden, tilstand, redigerbart, slettData,
  } = props;
  const { harAvklaring, virksomheter } = tilstand;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  return (
    <div className="vurderingArbeidsgiver">
      <Nav.typo.Undertittel>Velg arbeidsgiver eller selvstendig næringsvirksomhet:</Nav.typo.Undertittel>
      <div className="arbeidsgiver">
        <VirksomheterListe
          avklarteVirksomheter={virksomheter}
          virksomheterIPerioden={virksomheterIPerioden}
          {...props}
        />
        <div className="fane__knapplinje">
          <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" data-cy-nesteknapp="knapp_steg3" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    virksomheter: PT.array,
    harAvklaring: PT.bool,
  }).isRequired,
  virksomheterIPerioden: PT.arrayOf(MPT.Virksomhet).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingVirksomhet;
