import React from "react";
import PT from "prop-types";
import classnames from "classnames";

import * as Mui from "../felleskomponenter/ui";

import "./knapperad.css";

const Knapperad = ({
  bekreft,
  bekreftTekst,
  avbryt,
  avbrytTekst,
  redigerbart,
  bekreftRedigerbart,
  spinner,
  bekreftHtmlType,
  avbrytHtmlType,
  capitalCase,
}) => {
  const cls = classnames("container__knapperad");

  return (
    <div className={cls}>
      <Mui.Knapp
        capitalCase={capitalCase}
        htmlType={bekreftHtmlType}
        type="hoved"
        onClick={bekreft}
        disabled={!redigerbart || !bekreftRedigerbart}
        spinner={spinner}
      >
        {bekreftTekst}
      </Mui.Knapp>
      <Mui.Knapp capitalCase={capitalCase} htmlType={avbrytHtmlType} onClick={avbryt} disabled={!redigerbart}>
        {avbrytTekst}
      </Mui.Knapp>
    </div>
  );
};

Knapperad.propTypes = {
  bekreft: PT.func,
  bekreftTekst: PT.string.isRequired,
  avbryt: PT.func.isRequired,
  avbrytTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  bekreftRedigerbart: PT.bool,
  spinner: PT.bool,
  bekreftHtmlType: PT.string,
  avbrytHtmlType: PT.string,
  capitalCase: PT.bool,
};

Knapperad.defaultProps = {
  bekreft: undefined,
  bekreftRedigerbart: true,
  spinner: false,
  bekreftHtmlType: undefined,
  avbrytHtmlType: undefined,
  capitalCase: false,
};

export default Knapperad;
