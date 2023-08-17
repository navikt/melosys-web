import { useSelector } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../melosyskodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import { formSelectors } from "../../../ducks/form";

const { FRITEKST } = MKV.Koder.behandlinger.behandlingsaarsaktyper;

export const OpprettNyOppgave = () => {
  const { behandlingsaarsakType } = useSelector(formSelectors.OpprettNySakFormValuesSelector);
  const labelTilÅrsak = (aarsak: KTObject) => {
    if (aarsak.kode === FRITEKST) {
      return `${aarsak.term} (Maks 25 tegn)`;
    }
    return aarsak.term || "";
  };

  return (
    <div className="opprettnyoppgave">
      <Skjema.Datovelger feltNavn="mottaksdato" label={<Nav.Typo.Element>Mottaksdato</Nav.Typo.Element>} />
      <Skjema.Select feltNavn="behandlingsaarsakType" label="Årsak" className="aarsakfelt">
        {MKV.KTObjects.behandlinger.behandlingsaarsaktyper.map((aarsak: KTObject) => (
          <option key={aarsak.kode} value={aarsak.kode} label={labelTilÅrsak(aarsak)} />
        ))}
      </Skjema.Select>
      {behandlingsaarsakType === FRITEKST && (
        <Skjema.Input feltNavn="behandlingsaarsakFritekst" className="aarsakfelt" maxLength={25} />
      )}
    </div>
  );
};
