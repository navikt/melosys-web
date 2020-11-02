import React, { ComponentProps, SVGProps } from 'react';

import * as Mui from '../../ui';
import * as Ikoner from '../../../resources/images';

import './symboler.css';

type KnappeLenkeProps = ComponentProps<typeof Mui.Knappelenke>;
type SymbolProps = Omit<KnappeLenkeProps, 'title' | 'ikon'>;

export const Rediger = (props: SymbolProps) => (
  <Mui.Knappelenke
    {...props}
    onClick={props.onClick}
    title="Rediger"
    ikon={Ikoner.Pencil}
  />
);

export const SlettAlt = (props: SymbolProps) => (
  <Mui.Knappelenke
    {...props}
    onClick={props.onClick}
    title="Slett"
    ikon={Ikoner.Bin}
  />
);


export const SlettElement = (props: SVGProps<SVGSVGElement>) => (
  <span className={props.className} title="Slett">
    <Ikoner.Minus
      {...props}
      className="slett__element__symbol"
      onClick={props.onClick}
      width="24"
      height="24"
    />
  </span>
);
