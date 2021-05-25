import React from "react";
import PT from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";

import * as MPT from "../../../proptypes";
import * as Nav from "../../../utils/navFrontend";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Api from "../../../services/api";

import MKV from "../../../melosyskodeverk";
import { useFeatureToggle } from "../../../featuretoggle";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { vilkarOperations } from "../../../ducks/vilkar";

export const Varsler = ({
  oppfyllerInngangsvilkar,
  inngangsvilkaarBegrunnelser,
  inngangsvilkaar,
  overstyrInngangsvilkaarToggle,
}) => {
  const oppfyllerInngangsvilkarCl = classNames({
    liste__element: true,
    "liste__element--oppfylt": oppfyllerInngangsvilkar,
    "liste__element--ikkeoppfylt": !oppfyllerInngangsvilkar,
  });

  const oppfyltTekst = `Søknaden oppfyller${
    oppfyllerInngangsvilkar ? " " : " ikke "
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
        {!oppfyllerInngangsvilkar &&
          inngangsvilkaarBegrunnelser.map((begrunnelseKode) => (
            <li key={begrunnelseKode} className={oppfyllerInngangsvilkarCl}>
              {KV.kodeTilTerm(begrunnelseKode, MKV.KTObjects.begrunnelser.inngangsvilkaar)}
            </li>
          ))}
      </ul>
      {overstyrInngangsvilkaarToggle === "enabled" && !oppfyllerInngangsvilkar && (
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

Varsler.propTypes = {
  oppfyllerInngangsvilkar: PT.bool,
  inngangsvilkaarBegrunnelser: PT.arrayOf(PT.string),
  inngangsvilkaar: MPT.Vilkaar.isRequired,
  overstyrInngangsvilkaarToggle: PT.string.isRequired,
};

Varsler.defaultProps = {
  oppfyllerInngangsvilkar: undefined,
  inngangsvilkaarBegrunnelser: [],
};

export const VurderingInngang = ({
  bekreftOgFortsett,
  redigerbart,
  oppfyllerInngangsvilkar,
  inngangsvilkaar,
  inngangsvilkaar: { begrunnelseKoder: inngangsvilkaarBegrunnelser },
  tilstand: { harAvklaring },
  behandlingID,
  hentVilkar,
}) => {
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

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel>Kontroller inngangsvilkår</Nav.Typo.Undertittel>
      <Varsler
        oppfyllerInngangsvilkar={oppfyllerInngangsvilkar}
        inngangsvilkaarBegrunnelser={inngangsvilkaarBegrunnelser}
        inngangsvilkaar={inngangsvilkaar}
        overstyrInngangsvilkaarToggle={overstyrInngangsvilkaarToggle}
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

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  inngangsvilkaar: MPT.Vilkaar.isRequired,
  oppfyllerInngangsvilkar: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  hentVilkar: PT.func.isRequired,
};

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch) => {
  return {
    hentVilkar: (behandlingID) => dispatch(vilkarOperations.hent(behandlingID)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VurderingInngang);
