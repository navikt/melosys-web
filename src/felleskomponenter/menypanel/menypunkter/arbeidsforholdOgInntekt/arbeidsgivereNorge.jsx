import { connect } from "react-redux";
import PT from "prop-types";

import * as MPT from "../../../../proptypes";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import Organisasjon from "../arbeidsgiver/organisasjon";
import Arbeidsforholdene from "../arbeidsgiver/arbeidsforhold";
import Inntekt from "../arbeidsgiver/inntekt";

import "./arbeidsgivereNorge.less";
import { Accordion } from "@navikt/ds-react";

function ArbeidsgivereEnkeltNorge(props) {
  const { kilde, organisasjon, arbeidsforholdene, inntektListe, wrapIPanel = false } = props;

  const seksjoner = (
    <>
      <Organisasjon organisasjon={organisasjon} className="organisasjonSeksjon" visOrgnr visAdresseTittel={false} />
      <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />
      <Mui.Undertittel
        ikon={Ikoner.Inntekt}
        tekst={KV.Menypunkter.ArbeidsforholdOgInntekt.undertitler.inntekt}
        understrek
      />
      {kilde && <Inntekt inntektListe={inntektListe} />}
    </>
  );

  const seksjonerWrappetIPanel = (
    <Accordion>
      <Accordion.Item>
        <Accordion.Header>
          <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} />
        </Accordion.Header>
        <Accordion.Content>{seksjoner}</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );

  const seksjonerIkkeWrappetIPanel = (
    <>
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} />
      {seksjoner}
    </>
  );

  return (
    <div className="arbeidsgivereEnkeltNorge">{wrapIPanel ? seksjonerWrappetIPanel : seksjonerIkkeWrappetIPanel}</div>
  );
}

ArbeidsgivereEnkeltNorge.propTypes = {
  kilde: PT.string,
  organisasjon: MPT.Organisasjon.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  inntektListe: MPT.InntektListe.isRequired,
  wrapIPanel: PT.bool,
};

export function ArbeidsgivereNorge(props) {
  const { arbeidsgivereNorge } = props;

  const wrapIPanel = arbeidsgivereNorge.length > 1;

  return (
    <div className="arbeidsgivereNorge panelSeksjon">
      {arbeidsgivereNorge.map((arbeidsgiver) => (
        <ArbeidsgivereEnkeltNorge key={Utils._uuid()} {...arbeidsgiver} wrapIPanel={wrapIPanel} />
      ))}
    </div>
  );
}

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
};

const mapStateToProps = (state) => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
});

export default connect(mapStateToProps)(ArbeidsgivereNorge);
