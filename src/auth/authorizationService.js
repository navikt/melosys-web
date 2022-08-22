const groupMap = {
  groupRead: process.env.REACT_APP_GROUP_MELOSYS_TRYGDEAVGIFT_LES,
  groupWrite: process.env.REACT_APP_GROUP_MELOSYS_TRYGDEAVGIFT_SKRIV,
};

export function AuthorizationService(account) {
  return {
    hasReadAccess: account.idTokenClaims.groups.includes(groupMap.groupRead),
    hasWriteAccess: account.idTokenClaims.groups.includes(groupMap.groupWrite),
  };
}
