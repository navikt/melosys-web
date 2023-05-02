import React from "react";
import classNames from "classnames";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Api from "../../../services/api";
import * as Mui from "../../../felleskomponenter/ui";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { vilkarOperations } from "../../../ducks/vilkar";

import "./vurderingInngang.css";

const { OVERSTYRT_AV_SAKSBEHANDLER } = MKV.Koder.begrunnelser.inngangsvilkaar;

interface VarslerProps {
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaar: Api.Vilkar.Vilkaar | undefined;
  landkoder: Array<string>;
  behandlingstema: string;
  behandlingHarPeriodeOgLand: boolean;
}

export const Varsler = ({
  oppfyllerInngangsvilkar,
  inngangsvilkaar,
  landkoder,
  behandlingstema,
  behandlingHarPeriodeOgLand,
}: VarslerProps) => {
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
    if (!behandlingHarPeriodeOgLand) {
      return (
        <ul className="betingelser__liste">
          <li className={oppfyllerInngangsvilkarCl}>
            Det mangler periode og/eller land. Fyll disse inn i sidemenyen nedenfor og oppdater registeropplysninger.
          </li>
        </ul>
      );
    }
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

  const flereSoknadslandEnnTillatt = landkoder.length > 1 && !MKVUtils.kanHaFlereSoknadsland(behandlingstema);

  return (
    <div className="vurderinginngang">
      <ul className="betingelser__liste">
        <li className={oppfyllerInngangsvilkarCl}>{oppfyltTekst}</li>
        {inngangsvilkaarErOverstyrtEllerIkkeOppfylt &&
          visbareInngangsvilkaarBegrunnelseKoder.map((begrunnelseKode) => (
            <li key={begrunnelseKode} className={oppfyllerInngangsvilkarCl}>
              {KV.kodeTilTerm(begrunnelseKode, MKV.KTObjects.begrunnelser.inngangsvilkaar)}
            </li>
          ))}
      </ul>
      {flereSoknadslandEnnTillatt && (
        <Nav.AlertStripeAdvarsel>
          Du har valgt et behandlingstema som kun tillater ett arbeidsland. Du må fjerne arbeidsland, eller endre
          behandlingstema for å kunne fatte vedtak.
        </Nav.AlertStripeAdvarsel>
      )}
      {inngangsvilkaarErOverstyrtEllerIkkeOppfylt && (
        <Nav.AlertStripe type="info" className="vurderinginngang__inngangsvilkaar-ikke-oppfylt-alertstripe">
          Du har to valg:
          <ul>
            <li>Hvis inngangsvilkår ikke er oppfylt, må du henlegge saken som bortfalt (i behandlingsmenyen).</li>
            <li>Hvis inngangsvilkår er oppfylt, kan du fortsette behandlingen som normalt.</li>
          </ul>
          Ved behov kan du begrunne avgjørelsen i et notat.
        </Nav.AlertStripe>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingHarPeriodeOgLand: mottatteOpplysningerSelectors.HarPeriodeOgLandSelector(state),
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
  inngangsvilkaar: Api.Vilkar.Vilkaar | undefined;
  landkoder: Array<string>;
  behandlingstema: string;
  behandlingHarPeriodeOgLand: boolean;
};

export const VurderingInngang = ({
  bekreftOgFortsett,
  redigerbart,
  oppfyllerInngangsvilkar,
  inngangsvilkaar,
  behandlingID,
  hentVilkar,
  landkoder,
  behandlingstema,
  behandlingHarPeriodeOgLand,
}: VurderingInngangProps) => {
  const knappClickHandler = async () => {
    if (!oppfyllerInngangsvilkar) {
      await Api.Vilkar.overstyrInngangvilkaar(behandlingID);
      await hentVilkar(behandlingID);
    }

    bekreftOgFortsett();
  };

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Kontroller inngangsvilkår</Nav.Typo.Innholdstittel>
      <Varsler
        oppfyllerInngangsvilkar={oppfyllerInngangsvilkar}
        inngangsvilkaar={inngangsvilkaar}
        landkoder={landkoder}
        behandlingstema={behandlingstema}
        behandlingHarPeriodeOgLand={behandlingHarPeriodeOgLand}
      />
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !redigerbart,
          onClick: knappClickHandler,
        }}
      />
    </div>
  );
};

export default connector(VurderingInngang);
