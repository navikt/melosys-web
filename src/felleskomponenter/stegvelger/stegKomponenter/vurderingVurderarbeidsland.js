import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta, lagAvklartefaktaBegrunnelse } from '../../../regler/avklartefakta';

import SokkelSkipListe from '../../../felleskomponenter/sokkelskipliste';

import { formSelectors } from '../../../ducks/form';

import './vurderingVurderarbeidsland.css';

const VurderingVurderarbeidsland = ({
  bekreftOgFortsett,
  tilstand: {
    harAvklaring,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    installasjonArbeidslandTypeListe,
  },
  redigerbart,
  oppdaterData,
  slettData,
  maritimtArbeid,
  begrunnelser,
}) => {
  useEffect(() => {
    return () => {
      slettData();
    };
  }, []);

  const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(maritimtArbeid, enkeltMaritimtArbeid => enkeltMaritimtArbeid.enhetNavn);

  const avklartefaktaEndret = (type, subjektID, verdi) => {
    oppdaterData(lagAvklartfakta(type, subjektID, verdi, null));
  };

  const avklartefaktaBegrunnelseEndret = (type, subjektID, verdi) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, [verdi]));
  };

  return (
    <div>
      <Nav.typo.Undertittel>Vurder arbeidsland</Nav.typo.Undertittel>
      <SokkelSkipListe
        className="borderBottom"
        sokkelEllerSkipListe={sokkelEllerSkipListe}
        installasjonArbeidslandListe={installasjonArbeidslandListe}
        installasjonArbeidslandTypeListe={installasjonArbeidslandTypeListe}
        maritimtArbeid={maritimtArbeid}
        begrunnelser={begrunnelser}
        redigerbart={redigerbart && harMaritimeArbeidUnikeNavn}
        avklartefaktaEndretHandler={avklartefaktaEndret}
        avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelseEndret}
        oppdaterData={oppdaterData}
        slettData={slettData}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" data-cy-nesteknapp="knapp_steg4" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVurderarbeidsland.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
    sokkelEllerSkipListe: PT.array.isRequired,
    installasjonArbeidslandListe: PT.array.isRequired,
    installasjonArbeidslandTypeListe: PT.array.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  maritimtArbeid: PT.array,
};

VurderingVurderarbeidsland.defaultProps = {
  maritimtArbeid: [],
};

const mapStateToProps = state => ({
  maritimtArbeid: formSelectors.MaritimtArbeidSelector(state),
});

export default connect(mapStateToProps)(VurderingVurderarbeidsland);
