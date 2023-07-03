import { Fragment } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import * as MPT from "../../../../proptypes";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import Organisasjon from "../arbeidsgiver/organisasjon";
import Arbeidsforholdene from "../arbeidsgiver/arbeidsforhold";
import Inntekt from "../arbeidsgiver/inntekt";

import "./arbeidsgivereNorge.css";

const uuid = import("uuid/v4");

export const ArbeidsgivereEnkeltNorge = (props) => {
  const { kilde, organisasjon, arbeidsforholdene, inntektListe, wrapIPanel } = props;

  const seksjoner = (
    <Fragment>
      <Organisasjon organisasjon={organisasjon} className="organisasjonSeksjon" visOrgnr visAdresseTittel={false} />
      <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />
      <Mui.Undertittel
        ikon={Ikoner.Inntekt}
        tekst={KV.Menypunkter.ArbeidsforholdOgInntekt.undertitler.inntekt}
        understrek
      />
      {kilde && <Inntekt inntektListe={inntektListe} />}
    </Fragment>
  );

  const seksjonerWrappetIPanel = (
    <Mui.LesMerPanel
      intro={<Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} />}
      apneTekst="Vis info"
      lukkTekst="Skjul info"
      border
    >
      {seksjoner}
    </Mui.LesMerPanel>
  );

  const seksjonerIkkeWrappetIPanel = (
    <Fragment>
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} />
      {seksjoner}
    </Fragment>
  );

  return (
    <div className="arbeidsgivereEnkeltNorge">{wrapIPanel ? seksjonerWrappetIPanel : seksjonerIkkeWrappetIPanel}</div>
  );
};

ArbeidsgivereEnkeltNorge.propTypes = {
  kilde: PT.string,
  organisasjon: MPT.Organisasjon.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  inntektListe: MPT.InntektListe.isRequired,
  wrapIPanel: PT.bool,
};

ArbeidsgivereEnkeltNorge.defaultProps = {
  kilde: undefined,
  wrapIPanel: false,
};

export const ArbeidsgivereNorge = (props) => {
  const { arbeidsgivereNorge } = props;

  const wrapIPanel = arbeidsgivereNorge.length > 1;

  return (
    <div className="arbeidsgivereNorge panelSeksjon">
      {arbeidsgivereNorge.map((arbeidsgiver) => (
        <ArbeidsgivereEnkeltNorge key={uuid()} {...arbeidsgiver} wrapIPanel={wrapIPanel} />
      ))}
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
};

const mapStateToProps = (state) => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
});

export default connect(mapStateToProps)(ArbeidsgivereNorge);
