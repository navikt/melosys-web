import React, { ComponentProps } from 'react';

import * as Nav from '../../../utils/navFrontend';

type NavEtikettBaseProps = ComponentProps<typeof Nav.EtikettBase>;
type EtikettProps = Omit<NavEtikettBaseProps, 'type'>;

export const FraRegister = (props: EtikettProps) => <Nav.EtikettBase {...props} type="info" >Fra register</Nav.EtikettBase>;

export const FraSoknad = (props: EtikettProps) => <Nav.EtikettBase {...props} type="fokus">Fra søknad</Nav.EtikettBase>;
