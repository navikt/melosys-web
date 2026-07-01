import { Grunnlagsopplysninger } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { Beregningsregel } from "../../../../../services/modules/trygdeavgift";
import {
  formaterSats,
  formaterDekning,
  formaterInntektskilde,
  Beregningsforklaringer,
  erUnderMinstebeløp,
  MINSTEBELØP_ALERT_TEKST,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/beregningsforklaring";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import { formaterTilNorskBelopUtenDesimaler } from "../../../../../utils";
import { erPeriodeListeHelseutgiftdekkesperiode } from "../../../../../services/modules/types/periodeTyper";

const { SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;
const { MISJONÆR } = MKV.Koder.inntektskildetype;

interface DetaljerInterface {
  fom: string;
  tom: string;
  inntektskildetype: string;
  arbeidsgiversavgiftBetales: string;
  inntektPerMd: number;
  avgiftssats: number | null;
  avgiftPerMd: number;
  skattepliktig: string;
  dekning: string;
  beregningsregel?: Beregningsregel | null;
  harSammenslåtteInntektskilder?: boolean;
  avgiftsdel?: string | null;
}

export function BeregnetTrygdeavgiftDetaljer({
  grunnlag,
  medlemskapsTypeErPliktig,
}: {
  grunnlag: Grunnlagsopplysninger | undefined;
  medlemskapsTypeErPliktig: boolean;
}) {
  if (!grunnlag || !grunnlag.avgift) return null;
  const erHelseutgiftDekkesPeriode = erPeriodeListeHelseutgiftdekkesperiode(
    grunnlag.trygdeavgiftsgrunnlag.avgiftspliktigperioder,
  );
  const hentDetaljer = (data: Grunnlagsopplysninger): DetaljerInterface[] => {
    return data.avgift.trygdeavgiftsperioder
      .map((period) => {
        const overlappingSkatteforhold = data.trygdeavgiftsgrunnlag.skatteforholdsperioder.find(
          (s) => new Date(s.fomDato) <= new Date(period.tom) && new Date(s.tomDato) >= new Date(period.fom),
        );

        return {
          fom: period.fom,
          tom: period.tom,
          inntektskildetype: period.inntektskildetype,
          arbeidsgiversavgiftBetales: period.arbeidsgiversavgiftBetales ? "Ja" : "Nei",
          inntektPerMd: period.inntektPerMd,
          avgiftssats: period.avgiftssats,
          avgiftPerMd: period.avgiftPerMd,
          skattepliktig:
            overlappingSkatteforhold && overlappingSkatteforhold.skatteplikttype === SKATTEPLIKTIG ? "Ja" : "Nei",
          dekning: period.trygdedekning ?? "",
          beregningsregel: period.beregningsregel,
          harSammenslåtteInntektskilder: period.harSammenslåtteInntektskilder,
          avgiftsdel: period.avgiftsdel,
        };
      })
      .sort(Utils.dato.sorterEtterISOFomDato);
  };

  const arbAvgBetalesKreves = (kildetype: string) => !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

  const detaljerListe = hentDetaljer(grunnlag);
  const alleUnderMinstebeløp = detaljerListe.length > 0 && detaljerListe.every(erUnderMinstebeløp);

  return (
    <div className="tidligereGrunnlagPanel">
      {alleUnderMinstebeløp ? (
        <Nav.Alert variant="info">{MINSTEBELØP_ALERT_TEKST}</Nav.Alert>
      ) : (
        <>
          <Nav.Table size="small" className="periode_tabell">
            <Nav.Table.Header className="header_row">
              <Nav.Table.Row>
                <Nav.Table.HeaderCell scope="col">Trygdeperiode</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Sats</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Avgift md.</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Inntektskilde</Nav.Table.HeaderCell>
                <Nav.Table.HeaderCell scope="col">Bruttoinntekt md.</Nav.Table.HeaderCell>
                {!erHelseutgiftDekkesPeriode && <Nav.Table.HeaderCell scope="col">Betalt aga.?</Nav.Table.HeaderCell>}
                <Nav.Table.HeaderCell scope="col">Skattepliktig</Nav.Table.HeaderCell>
                {!erHelseutgiftDekkesPeriode && <Nav.Table.HeaderCell scope="col">Dekning</Nav.Table.HeaderCell>}
              </Nav.Table.Row>
            </Nav.Table.Header>
            <Nav.Table.Body>
              {detaljerListe.map((detaljer) => (
                <Nav.Table.Row className="border_top" key={Utils._uuid()}>
                  <Nav.Table.DataCell key={Utils._uuid()}>
                    {`${Utils.dato.formatterDatoTilNorsk(detaljer.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                      detaljer.tom,
                    )}`}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                    {formaterSats(detaljer)}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                    {formaterTilNorskBelopUtenDesimaler(detaljer.avgiftPerMd)} kr
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell key={Utils._uuid()}>
                    {formaterInntektskilde(detaljer, (kode) =>
                      KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, kode),
                    )}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell key={Utils._uuid()} className="tall_felt">
                    {formaterTilNorskBelopUtenDesimaler(detaljer.inntektPerMd)} kr
                  </Nav.Table.DataCell>
                  {!erHelseutgiftDekkesPeriode && (
                    <Nav.Table.DataCell key={Utils._uuid()}>
                      {arbAvgBetalesKreves(detaljer.inntektskildetype)
                        ? detaljer.arbeidsgiversavgiftBetales
                        : "Ikke relevant"}
                    </Nav.Table.DataCell>
                  )}
                  <Nav.Table.DataCell key={Utils._uuid()}>{detaljer.skattepliktig}</Nav.Table.DataCell>
                  {!erHelseutgiftDekkesPeriode && (
                    <Nav.Table.DataCell key={Utils._uuid()}>
                      {formaterDekning({ avgiftsdel: detaljer.avgiftsdel, trygdedekning: detaljer.dekning }, (kode) =>
                        KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, kode),
                      )}
                    </Nav.Table.DataCell>
                  )}
                </Nav.Table.Row>
              ))}
            </Nav.Table.Body>
          </Nav.Table>
          <Beregningsforklaringer perioder={detaljerListe} />
        </>
      )}
    </div>
  );
}
