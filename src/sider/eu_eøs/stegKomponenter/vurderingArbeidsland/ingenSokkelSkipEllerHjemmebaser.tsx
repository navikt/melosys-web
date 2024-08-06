import { ChangeEvent, Fragment, useEffect } from "react";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  slettAvklartfakta,
} from "../../../../felleskomponenter/stegvelger";
import * as KV from "../../../../kodeverk";
import { BOOLSK_STRING } from "../../../../constants";
import { hentFaktaVerdi } from "../../../../domeneUtils";
import * as Nav from "../../../../navFrontend";
import { Avklartfakta } from "../../../../services/modules/avklartefakta";

const { ARBEID_UTFORES_I_OPPGITT_LAND } = KV.Koder.avklartefaktaKoder;

interface IngenSokkelSkipEllerHjemmebaserProps {
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  redigerbart: boolean;
  arbeidUtforesIOppgittLandFakta?: Avklartfakta;
}

const IngenSokkelSkipEllerHjemmebaser = ({
  oppdaterData,
  slettData,
  redigerbart,
  arbeidUtforesIOppgittLandFakta,
}: IngenSokkelSkipEllerHjemmebaserProps) => {
  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(ARBEID_UTFORES_I_OPPGITT_LAND, arbeidUtforesIOppgittLandFakta));

    return () => {
      slettData(slettAvklartfakta(ARBEID_UTFORES_I_OPPGITT_LAND));
    };
  }, []);

  const vedEndring = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      oppdaterData(lagAvklartfakta(ARBEID_UTFORES_I_OPPGITT_LAND, null, BOOLSK_STRING.SANN, null));
    } else {
      slettData(slettAvklartfakta(ARBEID_UTFORES_I_OPPGITT_LAND));
    }
  };

  const erChecked = hentFaktaVerdi(arbeidUtforesIOppgittLandFakta) === BOOLSK_STRING.SANN;

  return (
    <Fragment>
      <Nav.Alert variant="info">
        Panelene er ikke utfylt med informasjon om arbeid på sokkel, skip eller hjemmebaser. Fyll ut feltene hvis det er
        relevant for å vurdere arbeidsland.
      </Nav.Alert>
      <Nav.CheckboxGroup legend="" hideLegend readOnly={!redigerbart}>
        <Nav.Checkbox checked={erChecked} onChange={vedEndring}>
          Arbeid utføres i land som er oppgitt
        </Nav.Checkbox>
      </Nav.CheckboxGroup>
    </Fragment>
  );
};

export default IngenSokkelSkipEllerHjemmebaser;
