import React, { useState, useEffect } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import classnames from 'classnames';

import * as Utils from '../../../../../utils';
import * as Mui from '../../../../ui';
import * as Nav from '../../../../../utils/navFrontend';
import * as Ikoner from '../../../../../resources/images';
import * as MPT from '../../../../../proptypes';
import * as OrganisasjonValidering from '../../../../skjema/validering/generisk/organisasjon';
import * as Api from '../../../../../services/api';

import EditableElement from '../../editableElement';
import Orgnrinput from './orgnrinput';
import Organisasjon from '../../arbeidsgiver/organisasjon';
import Kontaktopplysninger, { finnKontaktopplysninger } from '../../kontaktopplysninger';
import EnkeltArbeidsforholdNorgeRedigeringUtfort from './enkeltArbeidsforholdNorgeRedigeringUtfort';

import './arbeidsforholdNorgeListe.css';

export const EnkeltArbeidsforholdNorgeRedigerer = ({
  erstatt,
  valideringer,
  hentVedMount,
  redigerbart,
  hentOrganisasjon,
  organisasjon,
  orgIkkeFunnetTekst,
  orgFeilVedHentingTekst,
  onKontaktopplysningerChange,
  kontaktopplysninger,
}) => {
  const orgFinnes = !Utils._isEmpty(organisasjon) && !Utils._isEmpty(organisasjon.orgnr);

  return (
    <Nav.Row className="enkeltArbeidsforholdNorgeRedigerer">
      <Nav.Column xs="5">
        <Orgnrinput
          onOrgnrFunnet={erstatt}
          valideringer={valideringer}
          hentVedMount={hentVedMount}
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          defaultOrgnr={organisasjon.orgnr || ''}
          ikkeFunnetFeilmelding={orgIkkeFunnetTekst}
          feilVedHentingFeilmelding={orgFeilVedHentingTekst}
        />
        {
          orgFinnes &&
            <Organisasjon
              organisasjon={organisasjon}
              redigerbart={redigerbart}
              visNavn
              visAdresseTittel={false}
              boldAdresseNavn
            />
        }
      </Nav.Column>
      <Nav.Column xs="7">
        {
          orgFinnes &&
          <Kontaktopplysninger
            redigerbart={redigerbart}
            onChange={onKontaktopplysningerChange}
            kontaktopplysninger={kontaktopplysninger}
          />
        }
      </Nav.Column>
    </Nav.Row>
  );
};

EnkeltArbeidsforholdNorgeRedigerer.propTypes = {
  valideringer: PT.arrayOf(PT.shape({
    validering: PT.func.isRequired,
    feilmelding: PT.string.isRequired,
  })).isRequired,
  hentVedMount: PT.bool,
  organisasjon: MPT.Organisasjon.isRequired,
  erstatt: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  orgIkkeFunnetTekst: PT.string,
  orgFeilVedHentingTekst: PT.string,
  onKontaktopplysningerChange: PT.func.isRequired,
  kontaktopplysninger: PT.shape({
    kontaktnavn: PT.string,
    kontaktorgnr: PT.string,
  }).isRequired,
};

EnkeltArbeidsforholdNorgeRedigerer.defaultProps = {
  hentVedMount: false,
  orgIkkeFunnetTekst: undefined,
  orgFeilVedHentingTekst: undefined,
};

export const EnkeltArbeidsforholdNorge = ({
  fields,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  transformerOrgTilElement,
  elementerInneholderOrg,
  saksnummer,
  tittelTekst,
  tittelIkon,
  indeks,
  element,
  elementer,
}) => {
  const [kontaktopplysninger, setKontaktopplysninger] = useState({ kontaktorgnr: '', kontaktnavn: '' });

  const organisasjon = findOrganisasjon(element) || {};

  useEffect(() => {
    if (!OrganisasjonValidering.erOrgnrGyldig(organisasjon.orgnr)) return;

    finnKontaktopplysninger(saksnummer, organisasjon.orgnr)
      .then(({ kontaktnavn, kontaktorgnr }) => {
        setKontaktopplysninger({ kontaktnavn: kontaktnavn || '', kontaktorgnr: kontaktorgnr || '' });
      });
  }, [organisasjon.orgnr]);

  const slett = () => {
    fields.remove(indeks);

    try {
      Api.Fagsaker.kontaktopplysninger.slett(saksnummer, organisasjon.orgnr);
    } catch (e) {
      if (e.status !== 404) {
        Utils.logger.error(e);
      }
    }
  };

  const lagreKontaktOpplysninger = () => {
    if (kontaktopplysninger.kontaktorgnr && !OrganisasjonValidering.erOrgnrGyldig(kontaktopplysninger.kontaktorgnr)) return false;

    const data = {
      kontaktorgnr: kontaktopplysninger.kontaktorgnr || null,
      kontaktnavn: kontaktopplysninger.kontaktnavn || null,
    };

    try {
      Api.Fagsaker.kontaktopplysninger.send(saksnummer, organisasjon.orgnr, data);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }

    return false;
  };

  const erstatt = verdi => fields.splice(indeks, 1, transformerOrgTilElement(verdi));
  const valideringer = [
    {
      validering: orgnr => !OrganisasjonValidering.erOrgnrGyldig(orgnr),
      feilmelding: 'Ugyldig org.nr.',
    },
    {
      validering: orgnr => elementerInneholderOrg(elementer, orgnr) && orgnr !== organisasjon.orgnr,
      feilmelding: 'Organisasjon er allerede lagt til',
    },
  ];

  return (
    <EditableElement
      className="redigerbartElement"
      redigerbart={redigerbart}
      harData={Boolean(organisasjon.orgnr)}
      tittel={`${tittelTekst}${organisasjon.navn ? `: ${organisasjon.navn}` : ''}`}
      tittelIkon={tittelIkon}
      tittelUnderstrek
      onBinClick={slett}
      hentNyStatusVedHarData={false}
      onLagreClick={lagreKontaktOpplysninger}
      visLagreKnappBareHvisHarData
      redigererRender={() => (
        <EnkeltArbeidsforholdNorgeRedigerer
          erstatt={erstatt}
          valideringer={valideringer}
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          organisasjon={organisasjon}
          hentVedMount={Boolean(organisasjon.orgnr)}
          onKontaktopplysningerChange={setKontaktopplysninger}
          kontaktopplysninger={kontaktopplysninger}
        />
      )}
      redigeringUtfortRender={() => (
        <EnkeltArbeidsforholdNorgeRedigeringUtfort
          saksnummer={saksnummer}
          org={organisasjon}
        />
      )}
    />
  );
};

EnkeltArbeidsforholdNorge.propTypes = {
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  transformerOrgTilElement: PT.func.isRequired,
  elementerInneholderOrg: PT.func.isRequired,
  saksnummer: PT.string.isRequired,
  tittelTekst: PT.string.isRequired,
  tittelIkon: PT.elementType.isRequired,
  indeks: PT.number.isRequired,
  element: PT.any,
  elementer: PT.arrayOf(PT.any).isRequired,
};

EnkeltArbeidsforholdNorge.defaultProps = {
  element: {},
};

export const InnerArbeidsforholdNorgeListe = ({
  leggTilTekst,
  fields,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  transformerOrgTilElement,
  defaultElement,
  elementerInneholderOrg,
  saksnummer,
  tittelTekst,
  tittelIkon,
  className,
}) => {
  const elementer = fields.getAll() || [];

  const leggTilDefault = () => {
    fields.push(defaultElement);
  };

  const cls = classnames(className, 'innerArbeidsforholdNorgeListe');

  return (
    <div className={cls}>
      {
        elementer.map((element, indeks) => (
          <EnkeltArbeidsforholdNorge
            /* eslint-disable-next-line react/no-array-index-key */
            key={indeks}
            fields={fields}
            redigerbart={redigerbart}
            hentOrganisasjon={hentOrganisasjon}
            findOrganisasjon={findOrganisasjon}
            transformerOrgTilElement={transformerOrgTilElement}
            elementerInneholderOrg={elementerInneholderOrg}
            saksnummer={saksnummer}
            tittelTekst={tittelTekst}
            tittelIkon={tittelIkon}
            indeks={indeks}
            element={element}
            elementer={elementer}
          />
        ))
      }
      {
        redigerbart &&
        <div className="leggTilKnapp">
          <Mui.Knappelenke
            onClick={leggTilDefault}
            ikon={Ikoner.Add}
          >
            {leggTilTekst}
          </Mui.Knappelenke>
        </div>
      }
    </div>
  );
};

InnerArbeidsforholdNorgeListe.propTypes = {
  leggTilTekst: PT.string.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  transformerOrgTilElement: PT.func,
  defaultElement: PT.any,
  elementerInneholderOrg: PT.func.isRequired,
  saksnummer: PT.string.isRequired,
  tittelTekst: PT.string.isRequired,
  tittelIkon: PT.elementType.isRequired,
  className: PT.string,
};

InnerArbeidsforholdNorgeListe.defaultProps = {
  transformerOrgTilElement: verdi => verdi,
  defaultElement: undefined,
  className: undefined,
};

const ArbeidsforholdNorgeListe = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    rerenderOnEveryChange
    name={feltNavn}
    component={InnerArbeidsforholdNorgeListe}
    props={{ ...rest }}
  />
);

ArbeidsforholdNorgeListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default ArbeidsforholdNorgeListe;
