import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import EnkeltLandPure from '../../skjema/landvelger/enkeltLandPure';

const Forretningsstedet = props => {
  const { forretningsstedet, avklartForretningsland, oppdaterData } = props;
  if (!forretningsstedet) return null;

  useEffect(() => {
    if (avklartForretningsland) {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, avklartForretningsland));
    }
  }, []);

  const { navn, orgnr } = forretningsstedet;
  const landEndretHandler = e => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, orgnr, e));
  };

  const eksisterendeLand = hentFaktaVerdi(avklartForretningsland) || '';

  return (
    <Nav.Fieldset legend={navn}>
      <EnkeltLandPure
        label="Forretningssted:"
        onChange={landEndretHandler}
        value={eksisterendeLand}
        landkoder={MKV.KTObjects.landkoder}
        multiland={false}
      />
    </Nav.Fieldset>
  );
};

Forretningsstedet.propTypes = {
  forretningsstedet: PT.object.isRequired,
  avklartForretningsland: PT.object,
  oppdaterData: PT.func.isRequired,
};

Forretningsstedet.defaultProps = {
  avklartForretningsland: null,
};


const Forretningssteder = props => {
  const { valgteVirksomheter, avklarteForretningsland } = props;

  const ingenValgteVirksomheterVarsel = valgteVirksomheter.length === 0 && (
    <Nav.AlertStripe type="advarsel">Finner ingen valgte virksomheter.</Nav.AlertStripe>
  );

  return (
    <div>
      {
        valgteVirksomheter.map(valgtVirksomhet => {
          const key = `forretningssted${valgtVirksomhet.orgnr}-${valgtVirksomhet.navn}`;
          const avklartForretningsland = avklarteForretningsland.find(enkeltAvklaring => enkeltAvklaring.subjektID === valgtVirksomhet.orgnr);

          return <Forretningsstedet
            key={key}
            forretningsstedet={valgtVirksomhet}
            avklartForretningsland={avklartForretningsland}
            oppdaterData={props.oppdaterData}
          />;
        })
      }
      {ingenValgteVirksomheterVarsel}
    </div>
  );
};

Forretningssteder.propTypes = {
  valgteVirksomheter: PT.array.isRequired,
  avklarteForretningsland: PT.array.isRequired,
  oppdaterData: PT.func.isRequired,
};

const VurderingForretningssted = props => {
  const { bekreftOgFortsett } = props;

  useEffect(() => (
    function cleanup() {
      props.slettAllDataForSteg();
    }
  ), []);

  return (
    <div>
      <Nav.Undertittel>Vurder arbeidsgivers forretningssted</Nav.Undertittel>
      <Forretningssteder {...props} />
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingForretningssted.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.array,
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
};

VurderingForretningssted.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
};

export default VurderingForretningssted;
