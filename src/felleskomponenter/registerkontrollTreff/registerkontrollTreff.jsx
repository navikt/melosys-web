import PT from "prop-types";

import MKV from "../../melosyskodeverk";

import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";

import "./registerkontrolltreff.css";

const UnntakPeriodeBegrunnelse = (kode) => {
  if (!kode) return "";
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
};

function RegisterkontrollTreff({ vurderingBegrunnelser = [] }) {
  return vurderingBegrunnelser.map((begrunnelseKode) => (
    <div key={Utils._uuid()} className="registerkontroll-listeelement">
      <Ikoner.AdvarselSirkelFyll />
      <Nav.BodyLong size="small">{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.BodyLong>
    </div>
  ));
}

RegisterkontrollTreff.propTypes = {
  vurderingBegrunnelser: PT.arrayOf(PT.string),
};

export default RegisterkontrollTreff;
