import React from 'react';
import PT from 'prop-types';
import * as MPT from '../../proptypes';

import SokkelSkipEnkelt from './sokkelskipenkelt';

const SokkelSkipListe = ({
  sokkelEllerSkipListe,
  maritimtArbeid,
  begrunnelser,
  redigerbart,
  avklartefaktaEndretHandler,
  avklartefaktaBegrunnelserEndretHandler,
  oppdaterData,
  slettData,
  installasjonArbeidslandListe,
  installasjonArbeidslandTypeListe,
  className,
}) => (
  <div className={className}>
    { maritimtArbeid.map((enkelt, index) => (
      <SokkelSkipEnkelt
        key={enkelt.enhetNavn}
        maritimtArbeid={enkelt}
        sokkelEllerSkip={sokkelEllerSkipListe.find(avklartFakta => avklartFakta.subjektID === enkelt.enhetNavn)}
        arbeidslandAvklartfakta={installasjonArbeidslandListe.find(avklartFakta => avklartFakta.subjektID === enkelt.enhetNavn)}
        arbeidslandTypeAvklartfakta={installasjonArbeidslandTypeListe.find(avklartfakta => avklartfakta.subjektID === enkelt.enhetNavn)}
        index={index}
        begrunnelser={begrunnelser}
        redigerbart={redigerbart}
        avklartefaktaEndretHandler={avklartefaktaEndretHandler}
        avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelserEndretHandler}
        oppdaterData={oppdaterData}
        slettData={slettData}
      />))}
  </div>
);

SokkelSkipListe.propTypes = {
  sokkelEllerSkipListe: PT.array,
  installasjonArbeidslandListe: PT.array,
  installasjonArbeidslandTypeListe: PT.array,
  maritimtArbeid: PT.array,
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
  avklartefaktaEndretHandler: PT.func.isRequired,
  avklartefaktaBegrunnelserEndretHandler: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  className: PT.string,
};

SokkelSkipListe.defaultProps = {
  sokkelEllerSkipListe: [],
  maritimtArbeid: [],
  installasjonArbeidslandListe: [],
  installasjonArbeidslandTypeListe: [],
  className: undefined,
};

export default SokkelSkipListe;
