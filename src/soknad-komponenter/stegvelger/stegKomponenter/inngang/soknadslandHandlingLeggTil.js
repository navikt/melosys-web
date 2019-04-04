/* eslint react/no-multi-comp:off */
import React, { useState } from 'react';
import PT from 'prop-types';
import Ikon from 'melosys-ikoner-assets';
import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import EnkeltLandPure from '../../../skjema/landvelger/enkeltLandPure';

import { landTekstFormat } from '../../../skjema/landvelger';

export function LeggTilWrapper(props) {
  const [landkode, setLandkode] = useState('');
  const [begrunnelseKode, setBegrunnelseKode] = useState('0');

  const oppdaterBegrunnelse = event => {
    const kode = event.target.value;
    setBegrunnelseKode(kode);
  };

  const oppdaterLand = kode => (setLandkode(kode));

  const {
    bekreft, avbryt, alleLandkoder, soknadslandBegrunnelser, redigerbart,
  } = props;

  const erInputGyldig = (landkode && begrunnelseKode && begrunnelseKode !== '0');

  const innhold = (
    <div className="leggtilland__linje">
      <div className="linje__land">
        <EnkeltLandPure
          bredde="fullbredde"
          label="Velg land:"
          meta={{ error: undefined }}
          onChange={oppdaterLand}
          value={landkode}
          landkoder={alleLandkoder}
          className="linje__nedtrekksvelger"
          disabled={!redigerbart}
        />
      </div>
      <div className="linje__begrunnelse">
        <Nav.Select disabled={!redigerbart} bredde="fullbredde" value={begrunnelseKode} onChange={oppdaterBegrunnelse} label="Velg begrunnelse:" className="linje__nedtrekksvelger">
          <option disabled value="0" />
          {soknadslandBegrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
        </Nav.Select>
      </div>
      <div className="linje__knapper">
        <Nav.Knapp disabled={!redigerbart} onClick={avbryt}>Avbryt</Nav.Knapp>
        <Nav.Knapp onClick={() => bekreft(landkode, begrunnelseKode)} disabled={!(redigerbart && erInputGyldig)}>Legg til</Nav.Knapp>
      </div>
    </div>
  );
  return innhold;
}

LeggTilWrapper.propTypes = {
  avbryt: PT.func.isRequired,
  bekreft: PT.func.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  soknadslandBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

/**
 * SoknadslandHandlingLeggTil
 * @param props
 * @returns {*}
 * @constructor
 */
function SoknadslandHandlingLeggTil(props) {
  const [erLeggTilIntensjon, setIntensjon] = useState(false);

  const settLeggTilIntensjon = () => setIntensjon(true);
  const lukk = () => setIntensjon(false);

  const bekreftLeggTil = (landkode, begrunnelseKode) => {
    props.bekreftLeggTil(landkode, begrunnelseKode);
    lukk();
  };

  const { alleLandkoder, soknadslandBegrunnelser, redigerbart } = props;
  return (
    <div>
      <div>
        {!erLeggTilIntensjon && (
          <Nav.Knapp onClick={settLeggTilIntensjon} className="knappMedIkon" disabled={!redigerbart}>
            <Ikon kind="tilsette" /><div>Legg til nytt land</div>
          </Nav.Knapp>
        )}

        {erLeggTilIntensjon && (
          <LeggTilWrapper
            alleLandkoder={alleLandkoder}
            soknadslandBegrunnelser={soknadslandBegrunnelser}
            bekreft={bekreftLeggTil}
            avbryt={lukk}
            redigerbart={redigerbart}
          />
        )}
      </div>
      <div className="soknadsland__dataliste">
        <datalist id="alleLand">
          {alleLandkoder.map(item => (<option key={KV.objektTilKode(item)} value={landTekstFormat(item)} />))}
        </datalist>
      </div>
    </div>
  );
}

SoknadslandHandlingLeggTil.propTypes = {
  bekreftLeggTil: PT.func.isRequired,
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  soknadslandBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default SoknadslandHandlingLeggTil;
