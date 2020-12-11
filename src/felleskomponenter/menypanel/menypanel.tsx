import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as Nav from '../../utils/navFrontend';

import Sidemeny from '../sidemeny';

import { LinkGroupsFactory } from './linkgroups';

import { behandlingsgrunnlagSelectors } from '../../ducks/behandlingsgrunnlag';
import { behandlingerSelectors } from '../../ducks/behandlinger';
import { redigerbartSelectors } from '../../ducks/redigerbart';

import './menypanel.css';

const mapStateToProps = (state: RootState) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type MenypanelProps = PropsFromRedux & {
  lagreSoknadOgOppfriskSaksopplysninger: () => void,
};

export const Menypanel = ({
  behandlingsgrunnlagtype,
  behandlingstema,
  behandlingstype,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
}: MenypanelProps) => {
  const [[activeGroupIndex, activeLinkIndex], setActive] = useState<[number, number]>([0, 0]);

  const linkGroupsWithContent = LinkGroupsFactory.createLinkGroups({
    redigerbart,
    behandlingstema,
    behandlingstype,
    behandlingsgrunnlagtype,
    handlers: {
      lagreSoknadOgOppfriskSaksopplysninger,
    },
  });

  const handleClick = (groupIndex: number, linkIndex: number) => {
    setActive([groupIndex, linkIndex]);
  };

  const activeContent = linkGroupsWithContent.length !== 0 ?
    linkGroupsWithContent[activeGroupIndex].links[activeLinkIndex].content
    :
    null;

  const linkGroups = linkGroupsWithContent
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
