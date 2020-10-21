import React from 'react';
import bem from '@navikt/nap-bem-utils';

import * as Nav from '../../utils/navFrontend';

import MenyLink from './menylink';
import { Link } from './types';

import './linkgroup.css';

interface LinkGroupProps {
  label: string,
  links: Link[],
  onClick: (index: number) => void,
  theme?: string,
}

const linkgroupCls = bem('linkgroup');
const labelCls = linkgroupCls.element('label');

const LinkGroup = ({
  label,
  links,
  onClick,
  theme,
}: LinkGroupProps) => (
  <div className={linkgroupCls.block}>
    <Nav.typo.Normaltekst className={labelCls}>{label}</Nav.typo.Normaltekst>
    {
      links.map(({
        label: linkLabel,
        active,
        iconSrc,
        iconAltText,
      }, index) => (
        <MenyLink
          key={linkLabel.split(' ').join('')}
          label={linkLabel}
          active={active}
          onClick={() => onClick(index)}
          iconSrc={iconSrc}
          iconAltText={iconAltText}
          theme={theme}
        />
      ))
    }
  </div>
);

export default LinkGroup;
