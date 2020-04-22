import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { formValueSelector } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import * as Mui from '../../../felleskomponenter/ui';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta, lagAvklartefaktaBegrunnelse, slettAvklartfakta } from '../../../regler/avklartefakta';

import SokkelSkipListe from '../../../felleskomponenter/sokkelskipliste';

import { formSelectors } from '../../../ducks/form';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';
import { avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import MKV from '../../../melosyskodeverk';

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

export const VurderingVurderarbeidsland = ({
  bekreftOgFortsett,
  tilstand: {
    harAvklaring,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    installasjonArbeidslandTypeListe,
    arbeidslandListe,
    arbeidUtforesIOppgittLandFakta,
    soknadslandFaktaListe,
    harIngenSokkelSkipEllerHjemmebase,
    arbeidslandFaktaListe,
  },
  redigerbart,
  oppdaterData,
  slettData,
  maritimtArbeid,
  begrunnelser,
  hjemmebase,
  soknadsland,
  fjernedeSoknadsland,
  arbeidsland,
  fjernedeArbeidsland,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    soknadslandFaktaListe.forEach(fakta => {
      oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.SOKNADSLAND, fakta));
    });
    arbeidslandFaktaListe.forEach(fakta => {
      oppdaterData(konverterTilStegData(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, fakta));
    });

    setMounted(true);

    return () => {
      slettData();
    };
  }, []);

  const genererSoknadslandFakta = () => {
    soknadslandFaktaListe.forEach(fakta => {
      /**
       * Dette blir litt hacky. StegStore tillater bare overskriving av identisk faktatype fra annet steg,
       * så SOKNADSLAND-fakta må i utgangspunktet bygges på nytt her.
       */
      if (soknadsland.includes(fakta.subjektID)) {
        const faktaVerdi = hentFaktaVerdi(fakta);
        if (faktaVerdi === KV.Koder.SoknadslandFaktaTyper.USANN) {
          oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, fakta.subjektID, KV.Koder.SoknadslandFaktaTyper.SANN, []));
        } else {
          oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, fakta.subjektID, faktaVerdi, fakta.begrunnelseKoder));
        }
      } else if (fjernedeSoknadsland.map(l => l.land).includes(fakta.subjektID)) {
        const { begrunnelse } = fjernedeSoknadsland.find(({ land }) => land === fakta.subjektID);
        oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, fakta.subjektID, KV.Koder.SoknadslandFaktaTyper.USANN, [begrunnelse]));
      }
    });
  };

  useEffect(() => {
    if (mounted) genererSoknadslandFakta();
  }, [soknadsland]);

  const genererArbeidslandFakta = () => {
    slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND));

    arbeidsland
      .filter(land => land)
      .forEach(land => {
        oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, land, land, null));
      });
  };

  useEffect(() => {
    if (mounted) genererArbeidslandFakta();
  }, [arbeidsland.toString(), mounted]);

  const fjernSoknadsland = land => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, land, KV.Koder.SoknadslandFaktaTyper.IKKE_ARBEIDSLAND, null));
  };

  const angreFjernSoknadsland = land => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, land, KV.Koder.SoknadslandFaktaTyper.SANN, null));
  };

  const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(maritimtArbeid, enkeltMaritimtArbeid => enkeltMaritimtArbeid.enhetNavn);

  const avklartefaktaEndret = (type, subjektID, verdi) => {
    oppdaterData(lagAvklartfakta(type, subjektID, verdi, null));
  };

  const avklartefaktaBegrunnelseEndret = (type, subjektID, verdi) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, [verdi]));
  };

  const innhold = harIngenSokkelSkipEllerHjemmebase ?
    <IngenSokkelSkipEllerHjemmebase
      oppdaterData={oppdaterData}
      slettData={slettData}
      redigerbart={redigerbart}
      arbeidUtforesIOppgittLandFakta={arbeidUtforesIOppgittLandFakta}
    />
    :
    <Fragment>
      {
        maritimtArbeid.length > 0 &&
        <Fragment>
          <Nav.typo.Element className="undertittel">Vurdering sokkel/skip</Nav.typo.Element>
          <SokkelSkipListe
            className="borderBottom"
            sokkelEllerSkipListe={sokkelEllerSkipListe}
            installasjonArbeidslandListe={installasjonArbeidslandListe}
            installasjonArbeidslandTypeListe={installasjonArbeidslandTypeListe}
            arbeidslandListe={arbeidslandListe}
            maritimtArbeid={maritimtArbeid}
            begrunnelser={begrunnelser}
            redigerbart={redigerbart && harMaritimeArbeidUnikeNavn}
            avklartefaktaEndretHandler={avklartefaktaEndret}
            avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelseEndret}
            oppdaterData={oppdaterData}
            slettData={slettData}
          />
        </Fragment>
      }
      {
        hjemmebase &&
        <Nav.Row className="borderBottom">
          <Nav.Column xs="6">
            <Nav.typo.Element className="undertittel">Hjemmebase</Nav.typo.Element>
            <Mui.RedigerbarListe
              elementer={[
                {
                  kode: hjemmebase,
                  term: `${KV.kodeTilTerm(hjemmebase, MKV.KTObjects.landkoder)} (${hjemmebase})`,
                  fjernbar: false,
                },
              ]}
            />
          </Nav.Column>
        </Nav.Row>
      }
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.typo.Element className="undertittel">Land fra inngangsvilkår:</Nav.typo.Element>
          <Mui.RedigerbarListe
            elementer={soknadsland.map(kode => ({
              kode,
              term: `${KV.kodeTilTerm(kode, MKV.KTObjects.landkoder)} (${kode})`,
              defaultFjernet: fjernedeArbeidsland.includes(kode),
            }))}
            onFjern={fjernSoknadsland}
            onAngreFjern={angreFjernSoknadsland}
            redigerbar={redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
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
    arbeidslandListe: PT.array.isRequired,
    arbeidUtforesIOppgittLandFakta: MPT.Avklartefakta,
    soknadslandFaktaListe: PT.arrayOf(MPT.Avklartefakta),
    harIngenSokkelSkipEllerHjemmebase: PT.bool.isRequired,
    arbeidslandFaktaListe: PT.arrayOf(MPT.Avklartefakta),
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  maritimtArbeid: PT.array,
  hjemmebase: PT.string,
  soknadsland: PT.arrayOf(PT.string).isRequired,
  fjernedeSoknadsland: PT.arrayOf(PT.shape({
    land: PT.string,
    begrunnelse: PT.string,
  })).isRequired,
  arbeidsland: PT.arrayOf(PT.string).isRequired,
  fjernedeArbeidsland: PT.arrayOf(PT.string),
};

VurderingVurderarbeidsland.defaultProps = {
  maritimtArbeid: [],
  hjemmebase: '',
  fjernedeArbeidsland: [],
};

const inngangFormValuesSelector = formValueSelector(KV.Form.INNGANG);

const mapStateToProps = state => ({
  maritimtArbeid: formSelectors.MaritimtArbeidSelector(state),
  hjemmebase: behandlingsgrunnlagSelectors.HjemmebaseSelector(state),
  soknadsland: inngangFormValuesSelector(state, 'soknadsland'),
  fjernedeSoknadsland: inngangFormValuesSelector(state, 'fjernedeLand'),
  arbeidsland: avklartefaktaSelectors.ArbeidslandSelector(state),
  fjernedeArbeidsland: avklartefaktaSelectors.FjernedeArbeidslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVurderarbeidsland);
