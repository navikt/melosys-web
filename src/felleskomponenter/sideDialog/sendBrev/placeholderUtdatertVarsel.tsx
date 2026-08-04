import * as Nav from "../../../navFrontend";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { useBetingelseKatalog, usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { UtdatertPlaceholder } from "../../../services/modules/placeholdere";

interface Props {
  utdaterte: UtdatertPlaceholder[];
  uopploste: string[];
  uutfylte: string[];
  onSendLikevel: () => void;
  onAvbryt: () => void;
}

const overskriftFor = (harUtdaterte: boolean, harUopploste: boolean, harUutfylte: boolean): string => {
  // Flere kategorier har ingen felles ordlyd som er presis nok til å nevne alle.
  if ([harUtdaterte, harUopploste, harUutfylte].filter(Boolean).length > 1) return "Sjekk innholdet i brevet";
  if (harUtdaterte) return "Noen innsatte verdier er utdaterte";
  return harUopploste ? "Brevet inneholder uoppløste betingelser" : "Brevet har felter som ikke er fylt ut";
};

function PlaceholderUtdatertVarsel({ utdaterte, uopploste, uutfylte, onSendLikevel, onAvbryt }: Props) {
  // Modalen vises også for klammefelt alene, altså med placeholder-togglene av. Katalogen er
  // da kun til visningsnavn, og oppslagene faller tilbake til nøkkelen.
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  const katalogAktiv = Boolean(tekstblokkerPaa && dynamiskPlaceholderPaa);
  const { data: katalog } = usePlaceholderKatalog(katalogAktiv);
  const { data: betingelseKatalog } = useBetingelseKatalog(katalogAktiv);

  const visningsnavn = (nokkel: string) =>
    katalog?.find((beskrivelse) => beskrivelse.nokkel === nokkel)?.visningsnavn || nokkel;

  const betingelsesnavn = (nokkel: string) =>
    betingelseKatalog?.find((beskrivelse) => beskrivelse.nokkel === nokkel)?.visningsnavn || nokkel;

  return (
    <Nav.Modal open onClose={onAvbryt} aria-label="Sjekk innholdet i brevet" width="small">
      <Nav.Modal.Header>
        <Nav.Heading size="small" level="1">
          {overskriftFor(utdaterte.length > 0, uopploste.length > 0, uutfylte.length > 0)}
        </Nav.Heading>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        {utdaterte.length > 0 && (
          <>
            <Nav.BodyLong>
              Verdiene under ble satt inn tidligere og avviker fra sakens verdier i dag. Brevet sendes med teksten slik
              den står nå.
            </Nav.BodyLong>
            <Nav.List>
              {utdaterte.map(({ nokkel, innsattVerdi, ferskVerdi, fortsattKandidat }) => (
                <Nav.List.Item key={`${nokkel} ${innsattVerdi}`}>
                  {/* Et avvik som fortsatt står blant kandidatene kan være et bevisst valg –
                      det varsles, men uten å påstå at verdien er feil. */}
                  {fortsattKandidat
                    ? `${visningsnavn(nokkel)}: innsatt ${innsattVerdi} – forhåndsvalget er nå ${ferskVerdi}, men innsatt verdi er fortsatt et gyldig alternativ`
                    : `${visningsnavn(nokkel)}: innsatt ${innsattVerdi}, nå ${ferskVerdi || "ingen verdi"}`}
                </Nav.List.Item>
              ))}
            </Nav.List>
          </>
        )}
        {uopploste.length > 0 && (
          <>
            <Nav.BodyLong>
              Brevet inneholder uoppløste betingelser — disse må fjernes eller fylles ut manuelt.
            </Nav.BodyLong>
            <Nav.List>
              {uopploste.map((nokkel) => (
                <Nav.List.Item key={nokkel}>{betingelsesnavn(nokkel)}</Nav.List.Item>
              ))}
            </Nav.List>
          </>
        )}
        {uutfylte.length > 0 && (
          <>
            <Nav.BodyLong>Ikke utfylt — disse feltene står igjen i brevet slik de er:</Nav.BodyLong>
            <Nav.List>
              {uutfylte.map((felt) => (
                <Nav.List.Item key={felt}>{felt}</Nav.List.Item>
              ))}
            </Nav.List>
          </>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="primary" onClick={onSendLikevel}>
          Send likevel
        </Nav.Button>
        <Nav.Button variant="tertiary" onClick={onAvbryt}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default PlaceholderUtdatertVarsel;
