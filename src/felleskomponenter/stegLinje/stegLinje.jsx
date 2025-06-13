import PT from "prop-types";
import { connect } from "react-redux";

import StegIkon from "./stegIkon";
import "./stegLinje.css";
import * as Utils from "../../utils/index";

// TODO: Skrives om i MELOSYS-6023, hvorfor er Steglinje en <ul> ???
function StegLinje(props) {
  const { steg } = props;

  const stegKnapper = steg.map((item, index) => (
    <StegIkon
      key={Utils._uuid()}
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
      <nav>
        <ul className="stegLinje">{stegKnapper}</ul>
      </nav>
    </div>
  );
}

StegLinje.propTypes = {
  steg: PT.arrayOf(PT.object).isRequired,
  stegKlikk: PT.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegLinje);
