export function validateProposalType(type: i32): string {
  const proposalTypes = [
    'MINT',
    'BURN',
    'CALL',
    'VPERIOD',
    'GPERIOD',
    'QUORUM',
    'SUPERMAJORITY',
    'TYPE',
    'PAUSE',
    'EXTENSION',
    'ESCAPE',
    'DOCS',
  ];

  return proposalTypes[type];
}
