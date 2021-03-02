import React from "react";
import PT from "prop-types";
import classNames from "classnames";

import * as MPT from "../../../proptypes";
import * as Nav from "../../../utils/navFrontend";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

import MKV from "../../../melosyskodeverk";

export const Varsler = ({ oppfyllerInngangsvilkar, inngangsvilkaarBegrunnelser, inngangsvilkaar }) => {
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
    <ul className="betingelser__liste">
      <li className={oppfyllerInngangsvilkarCl}>{oppfyltTekst}</li>
      {!oppfyllerInngangsvilkar &&
        inngangsvilkaarBegrunnelser.map((begrunnelseKode) => (
          <li key={begrunnelseKode} className={oppfyllerInngangsvilkarCl}>
            {KV.kodeTilTerm(begrunnelseKode, MKV.KTObjects.begrunnelser.inngangsvilkaar)}
          </li>
        ))}
    </ul>
  );
};

Varsler.propTypes = {
  oppfyllerInngangsvilkar: PT.bool,
  inngangsvilkaarBegrunnelser: PT.arrayOf(PT.string),
  inngangsvilkaar: MPT.Vilkaar.isRequired,
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
}) => (
  <div className="vurderingInngang">
    <Nav.typo.Undertittel>Kontroller inngangsvilkår</Nav.typo.Undertittel>
    <Varsler
      oppfyllerInngangsvilkar={oppfyllerInngangsvilkar}
      inngangsvilkaarBegrunnelser={inngangsvilkaarBegrunnelser}
      inngangsvilkaar={inngangsvilkaar}
    />
    <div className="fane__knapplinje">
      <Nav.Knapp
        disabled={!(redigerbart && harAvklaring)}
        className="fane__navigasjonsknapp"
        data-cy-nesteknapp="knapp_steg0"
        onClick={bekreftOgFortsett}
      >
        Bekreft og fortsett
      </Nav.Knapp>
    </div>
  </div>
);

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  inngangsvilkaar: MPT.Vilkaar.isRequired,
  oppfyllerInngangsvilkar: PT.bool.isRequired,
};

export default VurderingInngang;
