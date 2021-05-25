import React from "react";
import classNames from "classnames";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../../utils/navFrontend";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Api from "../../../services/api";

import MKV from "../../../melosyskodeverk";
import { useFeatureToggle } from "../../../featuretoggle";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { vilkarOperations } from "../../../ducks/vilkar";

const { OVERSTYRT_AV_SAKSBEHANDLER } = MKV.Koder.begrunnelser.inngangsvilkaar;

interface VarslerProps {
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaarErOverstyrtAvSaksbehandler: boolean;
  inngangsvilkaarBegrunnelseKoder: string[];
  inngangsvilkaar: Api.Vilkar.Vilkaar;
  visHjelpeTekst: boolean;
}

export const Varsler = ({
  oppfyllerInngangsvilkar,
  inngangsvilkaarErOverstyrtAvSaksbehandler,
  inngangsvilkaarBegrunnelseKoder,
  inngangsvilkaar,
  visHjelpeTekst,
}: VarslerProps) => {
  const inngangsvilkaarErOverstyrtEllerIkkeOppfylt =
    inngangsvilkaarErOverstyrtAvSaksbehandler || !oppfyllerInngangsvilkar;
  const inngangsvilkaarErOppfyltOgIkkeOverstyrt = oppfyllerInngangsvilkar && !inngangsvilkaarErOverstyrtAvSaksbehandler;

  const oppfyllerInngangsvilkarCl = classNames({
    liste__element: true,
    "liste__element--oppfylt": inngangsvilkaarErOppfyltOgIkkeOverstyrt,
    "liste__element--ikkeoppfylt": inngangsvilkaarErOverstyrtEllerIkkeOppfylt,
  });

  const oppfyltTekst = `Søknaden oppfyller${
    inngangsvilkaarErOppfyltOgIkkeOverstyrt ? " " : " ikke "
  }inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.`;

  if (Utils._isEmpty(inngangsvilkaar)) {
    return (
      <ul className="betingelser__liste">
        <li className={oppfyllerInngangsvilkarCl}>Teknisk feil, finner ingen inngangsvilkår.</li>
      </ul>
    );
  }

  return (
    <>
      <ul className="betingelser__liste">
        <li className={oppfyllerInngangsvilkarCl}>{oppfyltTekst}</li>
        {inngangsvilkaarErOverstyrtEllerIkkeOppfylt &&
          inngangsvilkaarBegrunnelseKoder.map((begrunnelseKode) => (
            <li key={begrunnelseKode} className={oppfyllerInngangsvilkarCl}>
              {KV.kodeTilTerm(begrunnelseKode, MKV.KTObjects.begrunnelser.inngangsvilkaar)}
            </li>
          ))}
      </ul>
      {visHjelpeTekst && inngangsvilkaarErOverstyrtEllerIkkeOppfylt && (
        <Nav.AlertStripe type="info">
          Du har to valg:
          <ul>
            <li>Hvis inngangsvilkår ikke er oppfylt, må du henlegge saken som bortfalt (i behandlingsmenyen).</li>
            <li>Hvis inngangsvilkår er oppfylt, kan du fortsette behandlingen som normalt.</li>
          </ul>
          Ved behov kan du begrunne avgjørelsen i et notat.
        </Nav.AlertStripe>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentVilkar: (behandlingID: number) => dispatch(vilkarOperations.hent(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type VurderingInngangProps = PropsFromRedux & {
  bekreftOgFortsett: () => void;
  redigerbart: boolean;
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaar: Api.Vilkar.Vilkaar;
  tilstand: { harAvklaring: boolean };
};

export const VurderingInngang = ({
  bekreftOgFortsett,
  redigerbart,
  oppfyllerInngangsvilkar,
  inngangsvilkaar,
  inngangsvilkaar: { begrunnelseKoder: inngangsvilkaarBegrunnelseKoder },
  tilstand: { harAvklaring },
  behandlingID,
  hentVilkar,
}: VurderingInngangProps) => {
  const overstyrInngangsvilkaarToggle = useFeatureToggle("melosys.inngangsvilkaar.overstyr");

  const knappClickHandler = async () => {
    if (overstyrInngangsvilkaarToggle === "enabled" && !oppfyllerInngangsvilkar) {
      await Api.Vilkar.overstyrInngangvilkaar(behandlingID);
      await hentVilkar(behandlingID);
    }

    bekreftOgFortsett();
  };

  const bekreftOgFortsettKnappDisabled =
    overstyrInngangsvilkaarToggle === "enabled" ? !redigerbart : !(redigerbart && harAvklaring);

  const visbareInngangsvilkaarBegrunnelseKoder = inngangsvilkaarBegrunnelseKoder.filter(
    (kode) => kode !== OVERSTYRT_AV_SAKSBEHANDLER
  );

  const inngangsvilkaarErOverstyrtAvSaksbehandler = inngangsvilkaarBegrunnelseKoder.includes(
    OVERSTYRT_AV_SAKSBEHANDLER
  );

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel>Kontroller inngangsvilkår</Nav.Typo.Undertittel>
      <Varsler
        oppfyllerInngangsvilkar={oppfyllerInngangsvilkar}
        inngangsvilkaarBegrunnelseKoder={visbareInngangsvilkaarBegrunnelseKoder}
        inngangsvilkaar={inngangsvilkaar}
        visHjelpeTekst={overstyrInngangsvilkaarToggle === "enabled"}
        inngangsvilkaarErOverstyrtAvSaksbehandler={inngangsvilkaarErOverstyrtAvSaksbehandler}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp
          disabled={bekreftOgFortsettKnappDisabled}
          className="fane__navigasjonsknapp"
          data-cy-nesteknapp="knapp_steg0"
          onClick={knappClickHandler}
        >
          Bekreft og fortsett
        </Nav.Knapp>
      </div>
    </div>
  );
};

export default connector(VurderingInngang);
