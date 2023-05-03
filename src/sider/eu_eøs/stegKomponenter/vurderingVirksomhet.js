import React, { useEffect } from "react";
import PT from "prop-types";
import { useDispatch } from "react-redux";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as MPT from "../../../proptypes";

import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../felleskomponenter/stegvelger";
import * as KV from "../../../kodeverk";
import { BOOLSK_STRING } from "../../../constants";

import "./vurderingArbeidsgiver.css";
import { feiletResponsOperations } from "../../../ducks/feiletRespons";

/**
 * Enkeltsjekkboks for ett arbeidsgiver.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const VirksomheterLinje = (props) => {
  const { virksomheten, avklartVirksomhet, redigerbart, oppdaterData, slettData } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.VIRKSOMHET, avklartVirksomhet));

    const cleanup = () => {
      slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET));
    };
    return cleanup;
  }, []);

  const virksomhetErValgt = avklartVirksomhet && avklartVirksomhet.fakta.includes(BOOLSK_STRING.SANN);

  const virksomhetKlikkHandler = () => {
    const verdi = virksomhetErValgt ? BOOLSK_STRING.USANN : BOOLSK_STRING.SANN;
    dispatch(feiletResponsOperations.resetFeiletRespons());
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET, virksomheten.virksomhetId, verdi));
  };

  return (
    <div className="arbeidsgiver__enkeltlinje">
      <Mui.Checkbox
        disabled={!redigerbart}
        checked={virksomhetErValgt === true}
        onCheck={virksomhetKlikkHandler}
        label={`${virksomheten.navn}`}
      />
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
const VirksomheterListe = (props) => {
  const { virksomheterIPerioden, redigerbart, avklarteVirksomheter, oppdaterData, slettData } = props;

  const ingenVirksomheterVarsel = virksomheterIPerioden.length === 0 && (
    <Nav.AlertStripe type="advarsel">
      Finner ingen arbeidsgivere, selvstendig næringsdrivende eller frilansere fra saksopplysninger.
    </Nav.AlertStripe>
  );

  return (
    <div>
      {virksomheterIPerioden.map((virksomheten) => {
        const avklartfaktaForVirksomhet = avklarteVirksomheter.find(
          (enkeltAvklaring) => enkeltAvklaring.subjektID === virksomheten.virksomhetId
        );

        const key = `avklartVirksomhet${virksomheten.virksomhetId}`;
        return (
          <VirksomheterLinje
            virksomheten={virksomheten}
            avklartVirksomhet={avklartfaktaForVirksomhet}
            key={key}
            redigerbart={redigerbart}
            oppdaterData={oppdaterData}
            slettData={slettData}
          />
        );
      })}
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
const VurderingVirksomhet = (props) => {
  const { bekreftOgFortsett, virksomheterIPerioden, tilstand, redigerbart, slettData, tilbake } = props;
  const { harAvklaring, virksomheter } = tilstand;

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  return (
    <div className="vurderingArbeidsgiver">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Velg relevante virksomheter</Nav.Typo.Innholdstittel>
      <div className="arbeidsgiver">
        <VirksomheterListe
          avklarteVirksomheter={virksomheter}
          virksomheterIPerioden={virksomheterIPerioden}
          {...props}
        />
        <Mui.StegKnapper
          bekreftKnappProps={{
            disabled: !(redigerbart && harAvklaring),
            "data-cy-nesteknapp": "knapp_steg3",
            onClick: bekreftOgFortsett,
          }}
          tilbakeKnappProps={{
            onClick: tilbake,
            disabled: !redigerbart,
          }}
        />
      </div>
    </div>
  );
};

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  tilstand: PT.shape({
    virksomheter: PT.array,
    harAvklaring: PT.bool,
  }).isRequired,
  virksomheterIPerioden: PT.arrayOf(MPT.Virksomhet).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingVirksomhet;
