import PT from "prop-types";
import { v4 as uuid } from "uuid";
import { connect } from "react-redux";

import StegIkon from "./stegIkon";
import "./stegLinje.css";
import * as Ikoner from "../../resources/images";
import { FANE_STATUS } from "../stegvelger";

// TODO: Skrives om i MELOSYS-6023, hvorfor er Steglinje en <ul> ???
const StegLinje = (props) => {
  const { steg } = props;

  const stegKnapper = steg.map((item, index) => (
    <StegIkon
      key={uuid()}
      onClick={() => props.stegKlikk(index)}
      id={item.id}
      tittel={item.tittel}
      status={item.status}
      aktivtSteg={item.aktivtSteg}
      vedtakSteg={item.vedtakSteg}
    />
  ));

  return (
    <div>
      <ul className="stegLinje">{stegKnapper}</ul>
    </div>
  );
};

StegLinje.propTypes = {
  steg: PT.arrayOf(PT.object).isRequired,
  stegKlikk: PT.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegLinje);
