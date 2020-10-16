import React, { useState, ReactNode } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as Nav from '../../utils/navFrontend';

import MKV from '../../melosyskodeverk';

import Sidemeny from '../sidemeny';

import { behandlingsgrunnlagSelectors } from '../../ducks/behandlingsgrunnlag';
import { behandlingerSelectors } from '../../ducks/behandlinger';

import './menypanel.css';

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
}: MenypanelProps) => {
  const [[activeGroupIndex, activeLinkIndex], setActive] = useState<[number, number]>([0, 0]);

  const defaultLinkGroups: LinkGroup[] = [
    {
      label: hentLinkGroupLabels(behandlingstema)[0],
      links: [
        {
          label: 'Person',
          active: false,
          content: <div>Ikke implementert enda</div>,
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
          content: <div>Ikke implementert enda</div>,
        },
        {
          label: 'EU/EØS-barnetrygd',
          active: false,
          content: <div>Ikke implementert enda</div>,
        },
        {
          label: 'Arbeidsforhold og inntekt',
          active: false,
          content: <div>Ikke implementert enda</div>,
        },
      ],
    },
    {
      label: hentLinkGroupLabels(behandlingstema)[2],
      links: [
        {
          label: 'Arbeidsgiver/virksomhet',
          active: false,
          content: <div>Ikke implementert enda</div>,
        },
        {
          label: 'Fullmektig',
          active: false,
          content: <div>Ikke implementert enda</div>,
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
          content: <div>Ikke implementert enda</div>,
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

  const onClick = (groupIndex: number, linkIndex: number) => {
    setActive([groupIndex, linkIndex]);
  };

  const activeContent = defaultLinkGroups[activeGroupIndex].links[activeLinkIndex].content;

  const linkGroups = defaultLinkGroups
    .map((linkGroup, groupIndex) => ({
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
        })
        .map((link, linkIndex) => (
          {
            label: link.label,
            active: groupIndex === activeGroupIndex && linkIndex === activeLinkIndex,
          }
        )),
    }))
    // Filtrer bort linkgroups med ingen linker/menypunkter
    .filter(linkGroup => linkGroup.links.length > 0);

  return (
    <div className="menypanel">
      <Sidemeny
        heading="Opplysninger"
        linkGroups={linkGroups}
        onClick={onClick}
      />
      <Nav.Panel className="content">
        { activeContent }
      </Nav.Panel>
    </div>
  );
};

export default connector(Menypanel);
