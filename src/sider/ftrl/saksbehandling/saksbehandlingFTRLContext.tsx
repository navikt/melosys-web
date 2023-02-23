import React from "react";

export interface VilkarOgBegrunnelser {
  vilkaar: string;
  muligeBegrunnelser: string[];
}
interface BestemmelsesVilkar {
  bestemmelse: string;
  vilkårOgBegrunnelser: VilkarOgBegrunnelser[];
}

interface SaksbehandlingFTRLContextProps {
  bestemmelseVilkar: BestemmelsesVilkar[];
}

export const SaksbehandlingFTRLContext = React.createContext<SaksbehandlingFTRLContextProps>({
  bestemmelseVilkar: [],
});
