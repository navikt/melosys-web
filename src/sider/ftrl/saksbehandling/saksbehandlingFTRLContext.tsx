import React from "react";

export interface VilkarOgBegrunnelser {
  vilkaar: string;
  muligeBegrunnelser: string[];
}
export interface BestemmelsesVilkar {
  bestemmelse: string;
  vilkårOgBegrunnelser: VilkarOgBegrunnelser[];
}

interface SaksbehandlingFTRLContextProps {
  bestemmelseVilkar: BestemmelsesVilkar[];
}

export const SaksbehandlingFTRLContext = React.createContext<SaksbehandlingFTRLContextProps>({
  bestemmelseVilkar: [],
});
