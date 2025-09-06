import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";

import "./begrunnelser.less";

interface BegrunnelserProps {
  label: string;
  valgteBegrunnelser?: string[];
  muligeBegrunnelser?: { kode: string; term: string }[];
  fritekst?: string;
}

function Begrunnelser({ label, valgteBegrunnelser = [], muligeBegrunnelser = [], fritekst = "" }: BegrunnelserProps) {
  return (
    <div className="begrunnelser">
      <Nav.BodyLong weight="semibold" size="small" className="begrunnelseTittel">
        {label}
      </Nav.BodyLong>
      {valgteBegrunnelser.map((begrunnelse) => (
        <Nav.BodyLong size="small" className="begrunnelse" key={begrunnelse}>
          {KV.kodeTilTerm(begrunnelse, muligeBegrunnelser)}
        </Nav.BodyLong>
      ))}
      {fritekst && <div className="begrunnelse">{fritekst}</div>}
    </div>
  );
}

export default Begrunnelser;
