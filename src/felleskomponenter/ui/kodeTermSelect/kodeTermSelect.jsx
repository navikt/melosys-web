import PT from "prop-types";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

const kodeTermSelect = ({ koder, value, onChange, label, feil, disableForsteValg, redigerbart, onBlur, className }) => {
  const visValueIkkeOppgittIKoder = !redigerbart && !koder.includes(value);

  return (
    <Nav.Select
      value={value}
      onChange={onChange}
      label={label}
      feil={feil}
      disabled={!redigerbart}
      onBlur={onBlur}
      id={Utils._uuid()}
      className={className}
    >
      <option key="VELG" value="" disabled={disableForsteValg}>
        Velg...
      </option>
      {koder.map((k) => (
        <option key={k.kode} value={k.kode}>
          {k.term}
        </option>
      ))}
      {visValueIkkeOppgittIKoder && <option>{value}</option>}
    </Nav.Select>
  );
};

kodeTermSelect.propTypes = {
  koder: PT.array.isRequired,
  value: PT.any.isRequired,
  onChange: PT.func.isRequired,
  label: PT.string.isRequired,
  feil: PT.string,
  disableForsteValg: PT.bool,
  redigerbart: PT.bool,
  onBlur: PT.func,
  className: PT.string,
};

kodeTermSelect.defaultProps = {
  disableForsteValg: false,
  feil: undefined,
  redigerbart: true,
  onBlur: () => null,
  className: undefined,
};

export default kodeTermSelect;
