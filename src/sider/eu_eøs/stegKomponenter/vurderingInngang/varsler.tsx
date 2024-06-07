import * as Api from "../../../../services/api";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";
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
}

const Varsler = ({ oppfyllerInngangsvilkar, inngangsvilkaar, landkoder, behandlingstema }: VarslerProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const inngangsvilkaarBegrunnelseKoder = inngangsvilkaar?.begrunnelseKoder || [];

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
    (kode) => kode !== OVERSTYRT_AV_SAKSBEHANDLER
  );

  const visStorbritanniaKonvensjonTekst =
    konvensjonStorbritanniaToggleEnabled &&
    MKVUtils.erUtsendt(behandlingstema) &&
    MKVUtils.enesteLandErStorbritannia(landkoder);

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
      {inngangsvilkaarErOverstyrtEllerIkkeOppfylt && (
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
};

export default Varsler;
