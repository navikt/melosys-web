import { useSelector } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../melosyskodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import { formSelectors } from "../../../ducks/form";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING } from "../../../featuretoggle/toggleNavn";

const { FRITEKST, MELDING_OM_MANGLENDE_INNBETALING } = MKV.Koder.behandlinger.behandlingsaarsaktyper;

export const OpprettNyOppgave = () => {
  const { behandlingsaarsakType } = useSelector(formSelectors.OpprettNySakFormValuesSelector);
  const manglendeInnbetalingToggleEnabled = useFeatureToggle(MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING);

  const labelTilÅrsak = (aarsak: KTObject) => {
    if (aarsak.kode === FRITEKST) {
      return `${aarsak.term} (Maks 25 tegn)`;
    }
    return aarsak.term || "";
  };

  const gyldigeBehandlingsårsaker = () => {
    // TODO: MELOSYS-6312 medfører bedre logikk. Kanskje også samtidig legge dette i lovligeKombonasjoner i backend?
    if (manglendeInnbetalingToggleEnabled) {
      return MKV.KTObjects.behandlinger.behandlingsaarsaktyper;
    } else {
      return MKV.KTObjects.behandlinger.behandlingsaarsaktyper.filter(
        (kt: KTObject) => kt.kode !== MELDING_OM_MANGLENDE_INNBETALING
      );
    }
  };

  return (
    <div className="opprettnyoppgave">
      <Skjema.Datovelger feltNavn="mottaksdato" label={<Nav.Typo.Element>Mottaksdato</Nav.Typo.Element>} />
      <Skjema.Select feltNavn="behandlingsaarsakType" label="Årsak" className="aarsakfelt">
        {gyldigeBehandlingsårsaker().map((aarsak: KTObject) => (
          <option key={aarsak.kode} value={aarsak.kode} label={labelTilÅrsak(aarsak)} />
        ))}
      </Skjema.Select>
      {behandlingsaarsakType === FRITEKST && (
        <Skjema.Input feltNavn="behandlingsaarsakFritekst" className="aarsakfelt" maxLength={25} />
      )}
    </div>
  );
};
