import { useCallback, useState } from "react";
import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import { Beregningsforklaring, Trygdeavgiftsperiode } from "../../../services/modules/trygdeavgift";
import { Spinner } from "../../spinner";
import { useFeatureToggle } from "../../../featuretoggle";
import { VIS_TRYGDEAVGIFT_BEREGNINGSFORKLARING } from "../../../featuretoggle/toggleNavn";
import {
  formaterDekning,
  formaterInntektskilde,
  FormaterSats,
  Beregningsforklaringer,
  erUnderMinstebeløp,
  MINSTEBELØP_ALERT_TEKST,
} from "./beregningsforklaring";
import { BeregningsforklaringKort } from "./beregningsforklaringKort";
import { BeregningsforklaringKortProvider, ÅpneGrunnlagFn, feltId } from "./beregningsforklaringKortContext";

import "./trygdeavgiftsperioderTabell.less";

function TrygdeavgiftsperioderTabell({
  perioder,
  lagrePending,
  erEøsPensjonist = false,
  beregningsforklaringer,
}: {
  perioder?: Trygdeavgiftsperiode[];
  lagrePending: boolean;
  erEøsPensjonist?: boolean;
  beregningsforklaringer?: Beregningsforklaring[];
}) {
  const visBeregningsforklaring = useFeatureToggle(VIS_TRYGDEAVGIFT_BEREGNINGSFORKLARING) === true;
  const harForklaringer = Boolean(beregningsforklaringer && beregningsforklaringer.length > 0);
  const skalViseBeregningsforklaring = visBeregningsforklaring && harForklaringer;

  const [grunnlagÅpent, setGrunnlagÅpent] = useState(false);
  const [scrollTilFelt, setScrollTilFelt] = useState<string | null>(null);

  const åpneGrunnlag = useCallback<ÅpneGrunnlagFn>((aar, regelgruppe) => {
    setScrollTilFelt(feltId(aar, regelgruppe));
    setGrunnlagÅpent(true);
  }, []);

  // Nullstill valgt felt når kortet lukkes, slik at en senere manuell åpning
  // (ikke via `*`/«Hvorfor?») ikke scroller/markerer forrige valgte felt.
  const håndterGrunnlagToggle = useCallback((åpen: boolean) => {
    setGrunnlagÅpent(åpen);
    if (!åpen) setScrollTilFelt(null);
  }, []);

  if (!perioder) return null;

  const sortertePerioder = [...perioder].sort(Utils.dato.sorterEtterISOFomDato);
  const alleUnderMinstebeløp = sortertePerioder.length > 0 && sortertePerioder.every(erUnderMinstebeløp);
  const forklaringerForKoblinger = skalViseBeregningsforklaring ? beregningsforklaringer : undefined;

  return (
    <BeregningsforklaringKortProvider value={skalViseBeregningsforklaring ? åpneGrunnlag : undefined}>
      <div className="tabell-container">
        {lagrePending && (
          <div className="loader-container">
            <Spinner />
          </div>
        )}
        {alleUnderMinstebeløp ? (
          <Nav.Alert variant="info">{MINSTEBELØP_ALERT_TEKST}</Nav.Alert>
        ) : (
          <>
            <Nav.Table size="small" className="periode_tabell">
              <Nav.Table.Header className="header_row">
                <Nav.Table.Row>
                  <Nav.Table.HeaderCell scope="col">Trygdeperiode</Nav.Table.HeaderCell>
                  {!erEøsPensjonist && <Nav.Table.HeaderCell scope="col">Dekning</Nav.Table.HeaderCell>}
                  <Nav.Table.HeaderCell scope="col">Inntektskilde</Nav.Table.HeaderCell>
                  <Nav.Table.HeaderCell scope="col">Sats</Nav.Table.HeaderCell>
                  <Nav.Table.HeaderCell scope="col">Avgift per md.</Nav.Table.HeaderCell>
                </Nav.Table.Row>
              </Nav.Table.Header>
              <Nav.Table.Body>
                {sortertePerioder.map((trygdeavgiftsperiode) => (
                  <Nav.Table.Row className="border_top" key={Utils._uuid()}>
                    <Nav.Table.DataCell key={Utils._uuid()}>
                      {`${Utils.dato.formatterDatoTilNorsk(
                        trygdeavgiftsperiode.fom,
                      )} - ${Utils.dato.formatterDatoTilNorsk(trygdeavgiftsperiode.tom)}`}
                    </Nav.Table.DataCell>
                    {!erEøsPensjonist && (
                      <Nav.Table.DataCell key={Utils._uuid()}>
                        {formaterDekning(trygdeavgiftsperiode, (kode) =>
                          KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, kode),
                        )}
                      </Nav.Table.DataCell>
                    )}
                    <Nav.Table.DataCell key={Utils._uuid()}>
                      {formaterInntektskilde(trygdeavgiftsperiode, (kode) =>
                        KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, kode),
                      )}
                    </Nav.Table.DataCell>
                    <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                      <FormaterSats periode={trygdeavgiftsperiode} forklaringer={forklaringerForKoblinger} />
                    </Nav.Table.DataCell>
                    <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                      <b>{trygdeavgiftsperiode.avgiftPerMd}</b> nkr
                    </Nav.Table.DataCell>
                  </Nav.Table.Row>
                ))}
              </Nav.Table.Body>
            </Nav.Table>
            <Beregningsforklaringer perioder={sortertePerioder} forklaringer={forklaringerForKoblinger} />
            {skalViseBeregningsforklaring && (
              <BeregningsforklaringKort
                forklaringer={beregningsforklaringer!}
                open={grunnlagÅpent}
                onToggle={håndterGrunnlagToggle}
                scrollTilFelt={scrollTilFelt}
              />
            )}
          </>
        )}
      </div>
    </BeregningsforklaringKortProvider>
  );
}

export default TrygdeavgiftsperioderTabell;
