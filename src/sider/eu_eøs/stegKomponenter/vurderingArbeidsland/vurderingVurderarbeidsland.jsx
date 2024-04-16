import { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { formValueSelector } from "redux-form";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as MPT from "../../../../proptypes";
import * as Utils from "../../../../utils";
import * as Mui from "../../../../felleskomponenter/ui";
import { hentFaktaVerdi } from "../../../../domeneUtils";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartefaktaBegrunnelse,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../../felleskomponenter/stegvelger";

import SokkelSkipListe from "../../../../felleskomponenter/sokkelskipliste";

import { formSelectors } from "../../../../ducks/form";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";

import "./vurderingVurderarbeidsland.css";
import Redigerbarliste from "./redigerbarliste";

const IngenSokkelSkipEllerHjemmebaser = ({ oppdaterData, slettData, redigerbart, arbeidUtforesIOppgittLandFakta }) => {
  useEffect(() => {
    oppdaterData(
      konverterAvklartfaktaTilStegData(
        KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND,
        arbeidUtforesIOppgittLandFakta
      )
    );

    return () => {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND));
    };
  }, []);

  const vedEndring = ({ checked }) => {
    if (checked) {
      oppdaterData(
        lagAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND, null, BOOLSK_STRING.SANN, null)
      );
    } else {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.ARBEID_UTFORES_I_OPPGITT_LAND));
    }
  };

  const erChecked = hentFaktaVerdi(arbeidUtforesIOppgittLandFakta) === BOOLSK_STRING.SANN;

  return (
    <Fragment>
      <Nav.Alert variant="info">
        Panelene er ikke utfylt med informasjon om arbeid på sokkel, skip eller hjemmebaser. Fyll ut feltene hvis det er
        relevant for å vurdere arbeidsland.
      </Nav.Alert>
      <Nav.Fieldset legend="">
        <Mui.Checkbox
          label="Arbeid utføres i land som er oppgitt"
          onCheck={vedEndring}
          disabled={!redigerbart}
          checked={erChecked}
        />
      </Nav.Fieldset>
    </Fragment>
  );
};

IngenSokkelSkipEllerHjemmebaser.propTypes = {
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  arbeidUtforesIOppgittLandFakta: MPT.Avklartefakta,
};

IngenSokkelSkipEllerHjemmebaser.defaultProps = {
  arbeidUtforesIOppgittLandFakta: {},
};

export const VurderingVurderarbeidsland = ({
  bekreftOgFortsett,
  tilbake,
  tilstand: {
    harAvklaring,
    sokkelEllerSkipListe,
    installasjonArbeidslandListe,
    installasjonArbeidslandTypeListe,
    arbeidslandListe,
    arbeidUtforesIOppgittLandFakta,
    soknadslandFaktaListe,
    harIngenMaritimeArbeidEllerHjemmebaser,
    arbeidslandFaktaListe,
  },
  redigerbart,
  oppdaterData,
  slettData,
  maritimtArbeid,
  begrunnelser,
  hjemmebaser,
  soknadsland,
  arbeidsland,
  fjernedeArbeidsland,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    soknadslandFaktaListe.forEach((fakta) => {
      oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.SOKNADSLAND, fakta));
    });
    arbeidslandFaktaListe.forEach((fakta) => {
      oppdaterData(konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, fakta));
    });

    setMounted(true);

    return () => {
      slettData();
    };
  }, []);

  const genererArbeidslandFakta = () => {
    slettData(slettAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND));

    arbeidsland
      .filter((land) => land)
      .forEach((land) => {
        oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.ARBEIDSLAND, land, land, null));
      });
  };

  useEffect(() => {
    if (mounted) genererArbeidslandFakta();
  }, [arbeidsland.toString(), mounted]);

  const fjernSoknadsland = (land) => {
    oppdaterData(
      lagAvklartfakta(
        KV.Koder.avklartefaktaKoder.SOKNADSLAND,
        land,
        KV.Koder.SoknadslandFaktaTyper.IKKE_ARBEIDSLAND,
        null
      )
    );
  };

  const angreFjernSoknadsland = (land) => {
    slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.SOKNADSLAND, land));
  };

  const harMaritimeArbeidUnikeNavn = Utils.erPropertyUnik(
    maritimtArbeid,
    (enkeltMaritimtArbeid) => enkeltMaritimtArbeid.enhetNavn
  );

  const avklartefaktaEndret = (type, subjektID, verdi) => {
    oppdaterData(lagAvklartfakta(type, subjektID, verdi, null));
  };

  const avklartefaktaBegrunnelseEndret = (type, subjektID, verdi) => {
    oppdaterData(lagAvklartefaktaBegrunnelse(type, subjektID, [verdi]));
  };

  const innhold = harIngenMaritimeArbeidEllerHjemmebaser ? (
    <IngenSokkelSkipEllerHjemmebaser
      oppdaterData={oppdaterData}
      slettData={slettData}
      redigerbart={redigerbart}
      arbeidUtforesIOppgittLandFakta={arbeidUtforesIOppgittLandFakta}
    />
  ) : (
    <Fragment>
      {maritimtArbeid.length > 0 && (
        <Fragment>
          <Nav.Typo.Element className="undertittel">Vurdering sokkel/skip</Nav.Typo.Element>
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
      )}
      {hjemmebaser.length > 0 && (
        <Nav.Row className="borderBottom">
          <Nav.Column xs="6">
            <Nav.Typo.Element className="undertittel">Hjemmebaser</Nav.Typo.Element>
            <Redigerbarliste
              elementer={hjemmebaser.map((base) => ({
                kode: base,
                term: `${KV.kodeTilTerm(base, MKV.KTObjects.landkoder)} (${base})`,
                fjernbar: false,
              }))}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Typo.Element className="undertittel">Land fra inngangsvilkår:</Nav.Typo.Element>
          <Redigerbarliste
            elementer={soknadsland.map((kode) => ({
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
    </Fragment>
  );

  return (
    <div className="vurderingVurderArbeidsland">
      <Nav.Typo.Innholdstittel className="stegvelgertittel overskrift">Vurder arbeidsland</Nav.Typo.Innholdstittel>
      {innhold}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          "data-cy-nesteknapp": "knapp_steg4",
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

VurderingVurderarbeidsland.propTypes = {
  begrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
    sokkelEllerSkipListe: PT.array.isRequired,
    installasjonArbeidslandListe: PT.array.isRequired,
    installasjonArbeidslandTypeListe: PT.array.isRequired,
    arbeidslandListe: PT.array.isRequired,
    arbeidUtforesIOppgittLandFakta: MPT.Avklartefakta,
    soknadslandFaktaListe: PT.arrayOf(MPT.Avklartefakta),
    harIngenMaritimeArbeidEllerHjemmebaser: PT.bool.isRequired,
    arbeidslandFaktaListe: PT.arrayOf(MPT.Avklartefakta),
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  maritimtArbeid: PT.array,
  hjemmebaser: PT.arrayOf(PT.string),
  soknadsland: PT.arrayOf(PT.string).isRequired,
  arbeidsland: PT.arrayOf(PT.string).isRequired,
  fjernedeArbeidsland: PT.arrayOf(PT.string),
};

VurderingVurderarbeidsland.defaultProps = {
  maritimtArbeid: [],
  hjemmebaser: [],
  fjernedeArbeidsland: [],
};

const soknadFormValuesSelector = formValueSelector(KV.Form.SOKNAD);

const mapStateToProps = (state) => ({
  maritimtArbeid: formSelectors.MaritimtArbeidSelector(state),
  hjemmebaser: mottatteOpplysningerSelectors.HjemmebaserSelector(state),
  soknadsland: soknadFormValuesSelector(state, "soknadsland.landkoder"),
  arbeidsland: avklartefaktaSelectors.ArbeidslandSelector(state),
  fjernedeArbeidsland: avklartefaktaSelectors.IkkeArbeidslandSoknadslandSelector(state),
});

export default connect(mapStateToProps)(VurderingVurderarbeidsland);
