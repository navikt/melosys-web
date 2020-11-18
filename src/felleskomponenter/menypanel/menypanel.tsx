import React, { useState, ReactNode } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as Nav from '../../utils/navFrontend';

import MKV from '../../melosyskodeverk';

import Sidemeny from '../sidemeny';
import {
  ArbeidsforholdOgInntekt,
  ArbeidsgiverOgVirksomhet,
  Arbeidssteder,
  Barnetrygd,
  Fullmektig,
  Medlemskap,
  Person,
} from './menypunkter';

import { behandlingsgrunnlagSelectors } from '../../ducks/behandlingsgrunnlag';
import { behandlingerSelectors } from '../../ducks/behandlinger';
import { redigerbartSelectors } from '../../ducks/redigerbart';

import './menypanel.css';
import { menypanelSelectors } from '../../ducks/menypanel';

const {
  SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
} = MKV.Koder.behandlingsgrunnlagtyper;

const hentLinkGroupLabels = (behandlingstema: string): [string, string, string] => {
  const visSEDLabels = behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE ||
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND;

  if (visSEDLabels) {
    return [
      'FRA REGISTER OG SED',
      'FRA REGISTER',
      'FRA SED',
    ];
  }

  return [
    'FRA REGISTER OG SØKNAD',
    'FRA REGISTER',
    'FRA SØKNAD',
  ];
};

const mapStateToProps = (state: RootState) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
  visMenypanel: menypanelSelectors.ErMenypanelSynlig(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export type Menypunkt = 'Person' |
  'Familieforhold' |
  'Medlemskap' |
  'EU/EØS-barnetrygd' |
  'Arbeidsforhold og inntekt' |
  'Arbeidsgiver/virksomhet' |
  'Fullmektig' |
  'Utenlandsoppdraget' |
  'Lønn og godtgjørelser' |
  'Arbeidssteder(er)' |
  'Om virksomheten i Norge' |
  'Øvrig om arbeidstaker';
interface Link {
  label: Menypunkt,
  active: boolean,
  content: ReactNode,
  renderForBehandlingsgrunnlagtyper?: string[],
}
interface LinkGroup {
  label: string,
  links: Link[],
}

type MenypanelProps = PropsFromRedux & {
  menypunkter: Menypunkt[],
};

export const Menypanel = ({
  behandlingsgrunnlagtype,
  behandlingstema,
  menypunkter,
  visMenypanel,
  redigerbart,
}: MenypanelProps) => {
  const [[activeGroupIndex, activeLinkIndex], setActive] = useState<[number, number]>([0, 0]);

  if (!visMenypanel) return null;

  const visArbeidsforholdRolleEtiketter = behandlingsgrunnlagtype === SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;

  const defaultLinkGroups: LinkGroup[] = [
    {
      label: hentLinkGroupLabels(behandlingstema)[0],
      links: [
        {
          label: 'Person',
          active: false,
          content: <Person
            visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
            redigerbart={redigerbart}
          />,
        },
        {
          label: 'Familieforhold',
          active: false,
          content: <div>Ikke implementert enda</div>,
        },
      ],
    },
    {
      label: hentLinkGroupLabels(behandlingstema)[1],
      links: [
        {
          label: 'Medlemskap',
          active: false,
          content: <Medlemskap />,
        },
        {
          label: 'EU/EØS-barnetrygd',
          active: false,
          content: <Barnetrygd />,
        },
        {
          label: 'Arbeidsforhold og inntekt',
          active: false,
          content: <ArbeidsforholdOgInntekt />,
        },
      ],
    },
    {
      label: hentLinkGroupLabels(behandlingstema)[2],
      links: [
        {
          label: 'Arbeidsgiver/virksomhet',
          active: false,
          content: <ArbeidsgiverOgVirksomhet
            visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
            redigerbart={redigerbart}
          />,
        },
        {
          label: 'Fullmektig',
          active: false,
          content: <Fullmektig
            visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
            redigerbart={redigerbart}
          />,
        },
        {
          label: 'Utenlandsoppdraget',
          active: false,
          content: <div>Ikke implementert enda</div>,
        },
        {
          label: 'Lønn og godtgjørelser',
          active: false,
          content: <div>Ikke implementert enda</div>,
          renderForBehandlingsgrunnlagtyper: [SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS],
        },
        {
          label: 'Arbeidssteder(er)',
          active: false,
          content: <Arbeidssteder
            visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
            redigerbart={redigerbart}
          />,
        },
        {
          label: 'Om virksomheten i Norge',
          active: false,
          content: <div>Ikke implementert enda</div>,
          renderForBehandlingsgrunnlagtyper: [SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS],
        },
        {
          label: 'Øvrig om arbeidstaker',
          active: false,
          content: <div>Ikke implementert enda</div>,
          renderForBehandlingsgrunnlagtyper: [SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS],
        },
      ],
    },
  ];

  const handleClick = (groupIndex: number, linkIndex: number) => {
    setActive([groupIndex, linkIndex]);
  };

  const filteredLinkGroups = defaultLinkGroups
    .map(linkGroup => ({
      label: linkGroup.label,
      links: linkGroup.links
        // Filtrer menypunkter oppgitt i props
        .filter(link => menypunkter.includes(link.label))
        // Filtrer på behandlingsgrunnlagtype, (for å kunne skille mellom papir- og elektronisk søknad)
        .filter(link => {
          if (!link.renderForBehandlingsgrunnlagtyper || link.renderForBehandlingsgrunnlagtyper.length === 0) {
            return true;
          }

          return link.renderForBehandlingsgrunnlagtyper.includes(behandlingsgrunnlagtype);
        }),
    }))
    // Filtrer bort linkgroups med ingen linker/menypunkter
    .filter(linkGroup => linkGroup.links.length > 0);

  const activeContent = filteredLinkGroups.length !== 0 ?
    filteredLinkGroups[activeGroupIndex].links[activeLinkIndex].content
    :
    null;

  const linkGroups = filteredLinkGroups
    .map((linkGroup, groupIndex) => ({
      label: linkGroup.label,
      links: linkGroup.links
        .map((link, linkIndex) => (
          {
            label: link.label,
            active: groupIndex === activeGroupIndex && linkIndex === activeLinkIndex,
          }
        )),
    }));

  return (
    <div className="menypanel">
      <Sidemeny
        heading="Opplysninger"
        linkGroups={linkGroups}
        onClick={handleClick}
      />
      <Nav.Panel className="content">
        { activeContent }
      </Nav.Panel>
    </div>
  );
};

export default connector(Menypanel);
