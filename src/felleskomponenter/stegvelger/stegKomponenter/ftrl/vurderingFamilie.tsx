import React, { ChangeEventHandler, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import * as Nav from "../../../../utils/navFrontend";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../skjema";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { MedfolgendeBarn } from "../../../../kodeverk/form";
import { BOOLSK_STRING } from "../../../../constants";

import "./vurderingFamilie.css";
import { reduxForm } from "redux-form";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medfolgendeFamilie: behandlingsgrunnlagSelectors.MedfolgendeFamilieSelector(state),
  medfolgendeBarn: behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state),
  medfolgendeEktefelleSamboer: behandlingsgrunnlagSelectors.MedfolgendeEktefelleSamboerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  redigerbart: boolean;
}
const VurderingFamilie = ({
  bekreft,
  medfolgendeFamilie,
  medfolgendeBarn,
  medfolgendeEktefelleSamboer,
  redigerbart,
}: Props & PropsFromRedux) => {
  const [skalBarnInnvilgesMedlemskap, setSkalBarnInnvilgesMedlemskap] = useState(new Map());
  const [skalEktefelleSamboerInnvilgesMedlemskap, setSkalEktefelleSamboerInnvilgesMedlemskap] = useState(new Map());
  const [valgtBegrunnelse, setValgtBegrunnelse] = useState(new Map());

  const handleBarnInnvilgelseChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSkalBarnInnvilgesMedlemskap(new Map(skalBarnInnvilgesMedlemskap.set(event.target.name, event.target.value)));
  };

  const handleEktefelleInnvilgelseChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSkalEktefelleSamboerInnvilgesMedlemskap(
      new Map(skalEktefelleSamboerInnvilgesMedlemskap.set(event.target.name, event.target.value))
    );
  };

  const handleBarnBegrunnelseChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setValgtBegrunnelse(new Map(valgtBegrunnelse.set(event.target.name, event.target.value)));
  };

  const handleEktefelleBegrunnelseChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setValgtBegrunnelse(new Map(valgtBegrunnelse.set(event.target.name, event.target.value)));
  };

  return (
    <div className="vurderingFamilie">
      <Nav.typo.Undertittel className="undertittel">
        Skal medfolgendeFamilie oppgitt i søknaden innvilges medlemskap?
      </Nav.typo.Undertittel>

      {medfolgendeFamilie && medfolgendeFamilie.length > 0 ? (
        <div>
          <Nav.Fieldset legend="Barn">
            <Nav.Row>
              {medfolgendeBarn.map((barn: MedfolgendeBarn) => (
                <Nav.Column xs="6" key={barn.uuid}>
                  <Nav.typo.Normaltekst>{`${Utils.streng.storeForbokstaver(barn.navn)} (F.nr: ${
                    barn.fnr
                  })`}</Nav.typo.Normaltekst>
                  <Nav.Row className="familiemedlem_radio">
                    <Nav.Column xs="2">
                      <Nav.Radio
                        label="Ja"
                        name={barn.uuid}
                        onChange={handleBarnInnvilgelseChange}
                        checked={skalBarnInnvilgesMedlemskap.get(barn.uuid) === BOOLSK_STRING.SANN}
                        value={BOOLSK_STRING.SANN}
                        key={BOOLSK_STRING.SANN}
                        disabled={!redigerbart}
                      />
                    </Nav.Column>
                    <Nav.Column xs="2">
                      <Nav.Radio
                        label="Nei"
                        name={barn.uuid}
                        onChange={handleBarnInnvilgelseChange}
                        checked={skalBarnInnvilgesMedlemskap.get(barn.uuid) === BOOLSK_STRING.USANN}
                        value={BOOLSK_STRING.USANN}
                        key={BOOLSK_STRING.USANN}
                        disabled={!redigerbart}
                      />
                    </Nav.Column>
                  </Nav.Row>
                  {skalBarnInnvilgesMedlemskap.get(barn.uuid) === BOOLSK_STRING.USANN && (
                    <Nav.Select label="Begrunnelse:" onChange={handleBarnBegrunnelseChange}>
                      <option key="" value="" disabled={!redigerbart || valgtBegrunnelse.get(barn.uuid)}>
                        Velg...
                      </option>
                      {MKV.KTObjects.MEDFØLGENDE_BARN_BEGRUNNELSER_FTRL}
                    </Nav.Select>
                  )}
                </Nav.Column>
              ))}
            </Nav.Row>
            {medfolgendeBarn.some(
              (barn: MedfolgendeBarn) => skalBarnInnvilgesMedlemskap.get(barn.uuid) === BOOLSK_STRING.USANN
            ) && (
              <div>
                <Nav.typo.Element>Fritekst til avsnitt om barn i vedtaksbrev</Nav.typo.Element>
                <Skjema.HTMLEditor feltNavn="fritekst_barn" className="fritekst" />
              </div>
            )}
          </Nav.Fieldset>
          <Nav.Fieldset legend="Ektefelle/parner/samboer">
            <Nav.Row>
              {medfolgendeEktefelleSamboer.map((ektefelleSamboer: MedfolgendeBarn) => (
                <Nav.Column xs="6" key={ektefelleSamboer.uuid}>
                  <Nav.typo.Normaltekst>{`${Utils.streng.storeForbokstaver(ektefelleSamboer.navn)} (F.nr: ${
                    ektefelleSamboer.fnr
                  })`}</Nav.typo.Normaltekst>
                  <Nav.Row className="familiemedlem_radio">
                    <Nav.Column xs="2">
                      <Nav.Radio
                        label="Ja"
                        name={ektefelleSamboer.uuid}
                        onChange={handleEktefelleInnvilgelseChange}
                        checked={
                          skalEktefelleSamboerInnvilgesMedlemskap.get(ektefelleSamboer.uuid) === BOOLSK_STRING.SANN
                        }
                        value={BOOLSK_STRING.SANN}
                        key={BOOLSK_STRING.SANN}
                        disabled={!redigerbart}
                      />
                    </Nav.Column>
                    <Nav.Column xs="2">
                      <Nav.Radio
                        label="Nei"
                        name={ektefelleSamboer.uuid}
                        onChange={handleEktefelleInnvilgelseChange}
                        checked={
                          skalEktefelleSamboerInnvilgesMedlemskap.get(ektefelleSamboer.uuid) === BOOLSK_STRING.USANN
                        }
                        value={BOOLSK_STRING.USANN}
                        key={BOOLSK_STRING.USANN}
                        disabled={!redigerbart}
                      />
                    </Nav.Column>
                  </Nav.Row>
                  {skalEktefelleSamboerInnvilgesMedlemskap.get(ektefelleSamboer.uuid) === BOOLSK_STRING.USANN && (
                    <Nav.Select label="Begrunnelse:" onChange={handleEktefelleBegrunnelseChange}>
                      <option key="" value="" disabled={!redigerbart || valgtBegrunnelse.get(ektefelleSamboer.uuid)}>
                        Velg...
                      </option>
                    </Nav.Select>
                  )}
                </Nav.Column>
              ))}
            </Nav.Row>
            {medfolgendeEktefelleSamboer.some(
              (ektefelleSamboer: MedfolgendeBarn) =>
                skalEktefelleSamboerInnvilgesMedlemskap.get(ektefelleSamboer.uuid) === BOOLSK_STRING.USANN
            ) && (
              <div>
                <Nav.typo.Element>Fritekst til avsnitt om ektefelle/samboer i vedtaksbrev</Nav.typo.Element>
                <Skjema.HTMLEditor feltNavn="fritekst_barn" className="fritekst" />
              </div>
            )}
          </Nav.Fieldset>
        </div>
      ) : (
        <div>
          <Nav.AlertStripe className="alertstripe" type="suksess">
            Ingen medfølgende familiemedlemmer.
          </Nav.AlertStripe>
          <span>* Hvis dette ikke stemmer, må du legge inn nødvendig informasjon i menypunktet "Familieforhold".</span>
        </div>
      )}

      <div className="fane__knapplinje">
        <Nav.Hovedknapp mini disabled={false} className="fane__navigasjonsknapp" onClick={bekreft}>
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingFamilieForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.FAMILIE,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(VurderingFamilie);

export default connector(VurderingFamilieForm);
