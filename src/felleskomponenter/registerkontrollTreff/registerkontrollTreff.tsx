import MKV from "../../melosyskodeverk";

import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";

import "./registerkontrolltreff.less";

function UnntakPeriodeBegrunnelse(kode: string) {
  if (!kode) return "";
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
}

interface RegisterkontrollTreffProps {
  vurderingBegrunnelser?: string[];
}

function RegisterkontrollTreff({ vurderingBegrunnelser = [] }: RegisterkontrollTreffProps) {
  return vurderingBegrunnelser.map((begrunnelseKode) => (
    <div key={Utils._uuid()} className="registerkontroll-listeelement">
      <Ikoner.AdvarselSirkelFyll />
      <Nav.BodyLong size="small">{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.BodyLong>
    </div>
  ));
}

export default RegisterkontrollTreff;
