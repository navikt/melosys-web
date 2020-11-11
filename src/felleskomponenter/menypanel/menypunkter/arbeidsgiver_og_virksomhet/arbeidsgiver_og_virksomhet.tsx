import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';
import { Organisasjon } from 'Domene';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { formValueSelector } from 'redux-form';

import * as Nav from '../../../../utils/navFrontend';
import * as Mui from '../../../ui';
import * as KV from '../../../../kodeverk';
import * as Etiketter from '../etiketter';
import * as Ikoner from '../../../../resources/images';
import * as Utils from '../../../../utils';

import ArbeidsforholdNorgeListe from './arbeidsforholdNorgeListe';
import RedigerbartElementListe from '../redigerbartelementListe';
import EnkeltArbeidsforholdUtlandRedigerer from './enkeltArbeidsforholdUtlandRedigerer';
import EnkeltArbeidsforholdUtlandRedigeringUtfort from './enkeltArbeidsforholdUtlandRedigeringUtfort';

import { redigerbartSelectors } from '../../../../ducks/redigerbart';
import { OrganisasjonSelectors, OrganisasjonOperations } from '../../../../ducks/organisasjoner';
import { fagsakSelectors } from '../../../../ducks/fagsaker';

import './arbeidsgiver_og_virksomhet.css';

const arbeidsforholdUtlandHarData = (element: KV.Form.ArbeidsforholdUtland): boolean => (
  Boolean(element.navn ||
    element.orgnr ||
    Utils._isBoolean(element.selvstendigNaeringsvirksomhet) ||
    (element.adresse ? Utils.adresse.erStrukturertAdresseObjektTomt(element.adresse) : false))
);

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  ekstraArbeidsgivere: soknadFormValueSelector(state, 'ekstraArbeidsgivere'),
  selvstendigForetak: soknadFormValueSelector(state, 'selvstendigForetak'),
  arbeidsforholdUtland: soknadFormValueSelector(state, 'arbeidsforholdUtland'),
  selvstendigNaeringsvirksomhetUtland: soknadFormValueSelector(state, 'selvstendigNaeringsvirksomhetUtland'),
});
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ArbeidsgiverOgVirksomhet = ({
  redigerbart,
  organisasjoner,
  hentOrganisasjon,
  saksnummer,
  ekstraArbeidsgivere = [],
  selvstendigForetak = [],
  arbeidsforholdUtland = [],
  selvstendigNaeringsvirksomhetUtland = [],
}: PropsFromRedux) => {
  const finnOrganisasjon = (orgnr: string) => {
    const org: Organisasjon = organisasjoner.find((o: Organisasjon) => o.orgnr === orgnr);
    return org || { orgnr };
  };

  /* eslint-disable-next-line max-len */
  const arbeidsforholdUtlandHjelpetekst = 'Her legger du inn informasjon om utenlandsk arbeidsgiver som søker er ansatt og lønnet av. Når det ligger informasjon i dette panelet, blir det sendt kopi av A1 til Statlig skatteoppkreving.';

  return (
    <Nav.Container fluid className="arbeidsgiver__og__virksomhet">
      <div className="tittel">
        <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel}</Nav.typo.Undertittel>
        <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
        <Etiketter.ArbeidsgiversDel />
      </div>
      {
        ekstraArbeidsgivere.length === 0 &&
        <Mui.Undertittel
          ikon={Ikoner.Building}
          tekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdINorge}
          understrek
        />
      }
      <ArbeidsforholdNorgeListe
        className="arbeidsforhold__liste"
        saksnummer={saksnummer}
        leggTilTekst="Legg til arbeidsgiver og kontaktopplysninger"
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdINorge}
        tittelIkon={Ikoner.Building}
        feltNavn="ekstraArbeidsgivere"
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
        transformerOrgTilElement={(org: Organisasjon) => org.orgnr}
        findOrganisasjon={finnOrganisasjon}
        defaultElement={null}
        elementerInneholderOrg={(orgListe: string[], orgnr: string) => orgListe.includes(orgnr)}
      />
      {
        selvstendigForetak.length === 0 &&
        <Mui.Undertittel
          ikon={Ikoner.Man}
          tekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeINorge}
          understrek
        />
      }
      <ArbeidsforholdNorgeListe
        className="arbeidsforhold__liste"
        saksnummer={saksnummer}
        leggTilTekst="Legg til selvstendig virksomhet"
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeINorge}
        tittelIkon={Ikoner.Man}
        feltNavn="selvstendigForetak"
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
        transformerOrgTilElement={(org: Organisasjon) => ({ orgnr: org.orgnr })}
        findOrganisasjon={(org: Organisasjon) => organisasjoner.find((enkeltOrg: Organisasjon) => enkeltOrg.orgnr === org.orgnr)}
        defaultElement={{}}
        elementerInneholderOrg={(orgListe: Organisasjon[], orgnr: string) => orgListe.find(org => org.orgnr === orgnr)}
      />
      {
        arbeidsforholdUtland.length === 0 &&
        <Mui.Undertittel
          ikon={Ikoner.Building}
          tekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet}
          understrek
          etterTekst={
            <Nav.Hjelpetekst
              tittel={arbeidsforholdUtlandHjelpetekst}
              type={Nav.PopoverOrientering.Hoyre}
            >
              {arbeidsforholdUtlandHjelpetekst}
            </Nav.Hjelpetekst>
          }
        />
      }
      <RedigerbartElementListe
        redigerbart={redigerbart}
        className="arbeidsforhold__liste"
        feltNavn="arbeidsforholdUtland"
        leggTilTekst="Legg til arbeidsgiver og kontaktopplysninger"
        elementKomponentRedigerer={EnkeltArbeidsforholdUtlandRedigerer}
        elementKomponentRedigeringUtfort={EnkeltArbeidsforholdUtlandRedigeringUtfort}
        elementUnderstrek
        defaultElement={{ uuid: Utils._uuid() }}
        hentNavn={(element: KV.Form.ArbeidsforholdUtland) => element.navn}
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.arbeidsforholdIUtlandet}
        harData={arbeidsforholdUtlandHarData}
        tittelIkon={Ikoner.Building}
      />
      {
        selvstendigNaeringsvirksomhetUtland.length === 0 &&
        <Mui.Undertittel
          ikon={Ikoner.Man}
          tekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet}
          understrek
        />
      }
      <RedigerbartElementListe
        redigerbart={redigerbart}
        className="arbeidsforhold__liste"
        leggTilTekst="Legg til selvstendig virksomhet"
        feltNavn="selvstendigNaeringsvirksomhetUtland"
        elementKomponentRedigerer={EnkeltArbeidsforholdUtlandRedigerer}
        elementKomponentRedigeringUtfort={EnkeltArbeidsforholdUtlandRedigeringUtfort}
        elementUnderstrek
        defaultElement={{ uuid: Utils._uuid() }}
        hentNavn={(element: KV.Form.ArbeidsforholdUtland) => element.navn}
        tittelTekst={KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet}
        harData={arbeidsforholdUtlandHarData}
        tittelIkon={Ikoner.Man}
      />
    </Nav.Container>
  );
};

export default connector(ArbeidsgiverOgVirksomhet);
