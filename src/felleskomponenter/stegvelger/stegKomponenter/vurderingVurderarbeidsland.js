import React, { useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta, lagAvklartefaktaBegrunnelse, slettAvklartfakta } from '../../../regler/avklartefakta';

import SokkelSkipListe from '../../../felleskomponenter/sokkelskipliste';

import { formSelectors } from '../../../ducks/form';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import './vurderingVurderarbeidsland.css';

const IngenSokkelSkipEllerHjemmebase = ({
  oppdaterData,
  slettData,
  redigerbart,
  arbeidUtforesIOppgittLandFakta,
}) => {
  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND, arbeidUtforesIOppgittLandFakta));

    return () => {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND));
    };
  }, []);

  const vedEndring = e => {
    if (e.target.checked) {
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND, null, KV.Koder.BoolskAvklartfaktaType.SANN, null));
    } else {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND));
    }
  };

  const erChecked = hentFaktaVerdi(arbeidUtforesIOppgittLandFakta) === KV.Koder.BoolskAvklartfaktaType.SANN;

  return (
    <Fragment>
      <Nav.AlertStripe type="info">
        Panelene er ikke utfylt med informasjon om arbeid på sokkel, skip eller hjemmebase. Fyll ut feltene hvis det er relevant for å vurdere arbeidsland.
      </Nav.AlertStripe>
      <Nav.Fieldset legend="">
        <Nav.Checkbox
          label="Arbeid utføres i land som er oppgitt"
          onChange={vedEndring}
          disabled={!redigerbart}
          checked={erChecked}
        />
      </Nav.Fieldset>
    </Fragment>
  );
};

IngenSokkelSkipEllerHjemmebase.propTypes = {
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  arbeidUtforesIOppgittLandFakta: MPT.Avklartefakta,
};

IngenSokkelSkipEllerHjemmebase.defaultProps = {
  arbeidUtforesIOppgittLandFakta: {},
};

const VurderingVurderarbeidsland = ({
  bekreftOgFortsett,
  tilstand: {
    harAvklaring,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    installasjonArbeidslandTypeListe,
    arbeidUtforesIOppgittLandFakta,
  },
  redigerbart,
  oppdaterData,
  slettData,
  maritimtArbeid,
  begrunnelser,
  hjemmebase,
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

  const ingenSokkelskipEllerHjemmebase = sokkelEllerSkipListe.length === 0 && Utils._isEmpty(hjemmebase);

  const innhold = ingenSokkelskipEllerHjemmebase ?
    <IngenSokkelSkipEllerHjemmebase
      oppdaterData={oppdaterData}
      slettData={slettData}
      redigerbart={redigerbart}
      arbeidUtforesIOppgittLandFakta={arbeidUtforesIOppgittLandFakta}
    />
    :
    <Fragment>
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
    </Fragment>;

  return (
    <div>
      <Nav.typo.Undertittel className="overskrift">Vurder arbeidsland</Nav.typo.Undertittel>
      { innhold }
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
    arbeidUtforesIOppgittLandFakta: MPT.Avklartefakta,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  maritimtArbeid: PT.array,
  hjemmebase: PT.string,
};

VurderingVurderarbeidsland.defaultProps = {
  maritimtArbeid: [],
  hjemmebase: '',
};

const mapStateToProps = state => ({
  maritimtArbeid: formSelectors.MaritimtArbeidSelector(state),
  hjemmebase: behandlingsgrunnlagSelectors.HjemmebaseSelector(state),
});

export default connect(mapStateToProps)(VurderingVurderarbeidsland);
