import { useEffect } from "react";
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
import { kontrollOperations } from "../../../ducks/kontroll";
import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";

const VIRKSOMHET_HELPTEXT = (
  <>
    Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden.
    <br />
    Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold.
    <br /> Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under
    «Arbeidsgiver/virksomhet»
  </>
);

function VirksomhetCheckbox(props) {
  const { virksomheten, avklartVirksomhet, oppdaterData, slettData } = props;
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
    dispatch(kontrollOperations.resetKontrollFeil());
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET, virksomheten.virksomhetId, verdi));
  };

  return (
    <Nav.Checkbox onClick={virksomhetKlikkHandler} value={virksomheten.virksomhetId}>
      {virksomheten.navn}
    </Nav.Checkbox>
  );
}

VirksomhetCheckbox.propTypes = {
  virksomheten: MPT.Virksomhet.isRequired,
  avklartVirksomhet: MPT.Avklartefakta,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VirksomhetCheckbox.defaultProps = {
  avklartVirksomhet: null,
};

function VirksomheterCheckboxGroup(props) {
  const { virksomheterIPerioden, redigerbart, avklarteVirksomheter, oppdaterData, slettData } = props;

  const ingenVirksomheterVarsel = virksomheterIPerioden.length === 0 && (
    <Nav.Alert variant="warning">
      Finner ingen arbeidsgivere, selvstendig næringsdrivende eller frilansere fra saksopplysninger.
    </Nav.Alert>
  );

  const valgteVirksomheter = avklarteVirksomheter
    .filter((enkeltAvklaring) => enkeltAvklaring.fakta.includes(BOOLSK_STRING.SANN))
    .map((enkeltAvklaring) => enkeltAvklaring.subjektID);

  return (
    <Nav.CheckboxGroup
      legend={<LabelMedHjelpetekst label="Velg virksomhet(er)" hjelpetekst={VIRKSOMHET_HELPTEXT} />}
      readOnly={!redigerbart}
      defaultValue={valgteVirksomheter}
    >
      {virksomheterIPerioden.map((virksomheten) => {
        const avklartfaktaForVirksomhet = avklarteVirksomheter.find(
          (enkeltAvklaring) => enkeltAvklaring.subjektID === virksomheten.virksomhetId,
        );

        const key = `avklartVirksomhet${virksomheten.virksomhetId}`;
        return (
          <VirksomhetCheckbox
            virksomheten={virksomheten}
            avklartVirksomhet={avklartfaktaForVirksomhet}
            key={key}
            oppdaterData={oppdaterData}
            slettData={slettData}
          />
        );
      })}
      {ingenVirksomheterVarsel}
    </Nav.CheckboxGroup>
  );
}

VirksomheterCheckboxGroup.propTypes = {
  virksomheterIPerioden: PT.arrayOf(MPT.Virksomhet),
  avklarteVirksomheter: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VirksomheterCheckboxGroup.defaultProps = {
  virksomheterIPerioden: [],
  avklarteVirksomheter: [],
};

/**
 * Dette er hovedkomponenten for fanen "Velg Arbeidsgiver". Denne trekker inn ArbeidsgiverListe som er den egentlige utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger en arbeidsgiver.
 *
 * @param props
 */
function VurderingVirksomhet(props) {
  const { bekreftOgFortsett, virksomheterIPerioden, tilstand, redigerbart, slettData, tilbake } = props;
  const { harAvklaring, virksomheter } = tilstand;

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    [],
  );

  return (
    <div className="vurderingArbeidsgiver">
      <Nav.Heading size="large" className="stegvelgertittel">
        Virksomhet
      </Nav.Heading>
      <div className="arbeidsgiver">
        <VirksomheterCheckboxGroup
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
}

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
