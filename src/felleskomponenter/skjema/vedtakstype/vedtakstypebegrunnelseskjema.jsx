import PT from "prop-types";
import * as MKV from "@navikt/melosys-kodeverk";
import Select from "../input/select";
import * as Utils from "../../../utils";

function VedtakstypebegrunnelseSkjema({ className, redigerbart, feltNavn, label }) {
  return (
    <Select feltNavn={feltNavn} label={label} className={className} redigerbart={redigerbart} id={Utils._uuid()}>
      {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner.map(({ kode, term }) => (
        <option key={kode} value={kode}>
          {term}
        </option>
      ))}
    </Select>
  );
}

VedtakstypebegrunnelseSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  feltNavn: PT.string.isRequired,
  label: PT.string.isRequired,
};

export default VedtakstypebegrunnelseSkjema;
