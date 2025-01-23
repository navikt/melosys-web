import * as Api from "../../../../services/api";
import { useHentStatsborgerskapQuery } from "../../../../felleskomponenter/menypanel/menypunkter/person/statsborgerskapTable/hentStatsborgerskap.generated";
import classNames from "classnames";
import * as Utils from "../../../../utils";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";

const { OVERSTYRT_AV_SAKSBEHANDLER } = MKV.Koder.begrunnelser.inngangsvilkaar;

interface VarslerProps {
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaar: Api.Vilkar.Vilkaar | undefined;
  landkoder: Array<string>;
  behandlingstema: string;
  behandlingID: number;
}

function Varsler({ oppfyllerInngangsvilkar, inngangsvilkaar, landkoder, behandlingstema, behandlingID }: VarslerProps) {
  const inngangsvilkaarBegrunnelseKoder = inngangsvilkaar?.begrunnelseKoder || [];
  const { data: statsborgerskapData } = useHentStatsborgerskapQuery({
    variables: { behandlingID },
  });
  const statsborgerskapLand =
    statsborgerskapData?.hentSaksopplysninger?.persondata?.statsborgerskap?.map(
      (statsborgerskap) => statsborgerskap.land,
    ) ?? [];

  const inngangsvilkaarErOverstyrtAvSaksbehandler =
    inngangsvilkaarBegrunnelseKoder.includes(OVERSTYRT_AV_SAKSBEHANDLER);

  const inngangsvilkaarErOverstyrtEllerIkkeOppfylt =
    inngangsvilkaarErOverstyrtAvSaksbehandler || !oppfyllerInngangsvilkar;

  const inngangsvilkaarErOppfyltOgIkkeOverstyrt = oppfyllerInngangsvilkar && !inngangsvilkaarErOverstyrtAvSaksbehandler;

  const oppfyllerInngangsvilkarCl = classNames({
    liste__element: true,
    "liste__element--oppfylt": inngangsvilkaarErOppfyltOgIkkeOverstyrt,
    "liste__element--ikkeoppfylt": inngangsvilkaarErOverstyrtEllerIkkeOppfylt,
  });

  if (Utils._isEmpty(inngangsvilkaar)) {
    return (
      <ul className="betingelser__liste">
        <li className={oppfyllerInngangsvilkarCl}>Teknisk feil, finner ingen inngangsvilkår.</li>
      </ul>
    );
  }

  const oppfyltTekst = `Søknaden oppfyller${
    inngangsvilkaarErOppfyltOgIkkeOverstyrt ? " " : " ikke "
  }inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.`;

  const visbareInngangsvilkaarBegrunnelseKoder = inngangsvilkaarBegrunnelseKoder.filter(
    (kode) => kode !== OVERSTYRT_AV_SAKSBEHANDLER,
  );

  const erFraEllerSkalTilStorbritannia =
    statsborgerskapLand.includes(MKV.Terms.landkoder.GB.toUpperCase()) || MKVUtils.enesteLandErStorbritannia(landkoder);

  const visStorbritanniaKonvensjonTekst = MKVUtils.erUtsendt(behandlingstema) && erFraEllerSkalTilStorbritannia;

  return (
    <div className="vurderinginngang_eu_eos">
      <ul className="betingelser__liste">
        <li className={oppfyllerInngangsvilkarCl}>{oppfyltTekst}</li>
        {inngangsvilkaarErOverstyrtEllerIkkeOppfylt &&
          visbareInngangsvilkaarBegrunnelseKoder.map((begrunnelseKode) => (
            <li key={begrunnelseKode} className={oppfyllerInngangsvilkarCl}>
              {KV.kodeTilTerm(begrunnelseKode, MKV.KTObjects.begrunnelser.inngangsvilkaar)}
            </li>
          ))}
      </ul>
      {(inngangsvilkaarErOverstyrtEllerIkkeOppfylt || visStorbritanniaKonvensjonTekst) && (
        <Nav.Alert variant="info">
          {visStorbritanniaKonvensjonTekst && (
            <p className="storbritannia-konv-tekst">
              Husk at du må vurdere om inngangsvilkårene i konvensjonen med Storbritannia av 30. juni 2023, eller
              separasjonsavtalen av 28. januar 2020, er oppfylt.
            </p>
          )}
          Du har to valg:
          <ul>
            <li>Hvis inngangsvilkår ikke er oppfylt, må du avslutte saken fra behandlingsmenyen</li>
            <li>Hvis inngangsvilkår er oppfylt, kan du fortsette behandlingen som normalt</li>
          </ul>
        </Nav.Alert>
      )}
    </div>
  );
}

export default Varsler;
