import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { useFeatureToggle } from "../../../featuretoggle";
import { ÅRSAVREGNING_EØS_PENSJONIST, ÅRSAVREGNING_EØS_TJENESTEPERSON } from "../../../featuretoggle/toggleNavn";
import MKV from "../../../melosyskodeverk";

const { EU_EOS } = MKV.Koder.sakstyper;
const { TRYGDEAVGIFT } = MKV.Koder.sakstemaer;
const { PENSJONIST, ARBEID_TJENESTEPERSON_ELLER_FLY } = MKV.Koder.behandlinger.behandlingstema;

/**
 * MELOSYS-8163: årsavregning for EØS pensjonist og EØS offentlig tjenesteperson/flyvende personell
 * opprettes automatisk, men selve gjennomføringen av årsavregningsbehandlingen støttes ikke ennå.
 * Returnerer true når saksbehandler skal blokkeres fra å bekrefte årsavregningssteget eller fatte
 * årsavregningsvedtak. Blokkeringen fjernes per sakstype når respektiv toggle slås på.
 */
export function useErÅrsavregningIkkeStøttetSakstype(): boolean {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const erÅrsavregningEøsPensjonistToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);
  const erÅrsavregningEøsTjenestepersonToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_TJENESTEPERSON);

  const erEøsTrygdeavgiftPensjonist =
    sakstype === EU_EOS && sakstema === TRYGDEAVGIFT && behandlingstema === PENSJONIST;
  // Sakstema sjekkes bevisst ikke her, i tråd med OppretteÅrsavregningVedEndring.kt sin
  // harTemaOgTypeSomSkalBehandles (kun sakstype + behandlingstema + artikkel 11.3b avgjør tjenesteperson-status).
  const erEøsTjenesteperson = sakstype === EU_EOS && behandlingstema === ARBEID_TJENESTEPERSON_ELLER_FLY;

  return (
    (erEøsTrygdeavgiftPensjonist && !erÅrsavregningEøsPensjonistToggleEnabled) ||
    (erEøsTjenesteperson && !erÅrsavregningEøsTjenestepersonToggleEnabled)
  );
}
