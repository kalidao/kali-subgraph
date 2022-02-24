import { Token, Tribute, TributeProposal } from '../generated/schema';
import {
  NewTributeProposal as NewTributeProposalEvent,
  TributeProposalCancelled as TributeProposalCancelledEvent,
  TributeProposalReleased as TributeProposalReleasedEvent,
} from '../generated/KaliDAOtribute/KaliDAOtribute';
import { tokenName, tokenSymbol, tokenTotalSupply } from './token-helpers';
import { ZERO_ADDRESS } from './constants';

// NewTributeProposal
export function handleNewTributeProposal(event: NewTributeProposalEvent): void {
  const daoId = event.params.dao.toHexString();
  const tributeId = daoId + '-tribute';
  let tribute = Tribute.load(tributeId);

  if (tribute === null) {
    tribute = new Tribute(tributeId);
  }

  tribute.dao = daoId;
  tribute.active = true;

  tribute.save();

  const tributeProposalId = tributeId + '-' + event.params.proposal.toHexString();
  const tributeProposal = new TributeProposal(tributeProposalId);
  tributeProposal.asset = event.params.asset;
  tributeProposal.isNFT = event.params.nft;

  if (!event.params.nft && event.params.asset.toHexString() != ZERO_ADDRESS) {
    const tokenId = daoId + event.params.asset.toHexString();
    const token = new Token(tokenId);

    tributeProposal.token = tokenId;
    token.dao = daoId;
    token.name = tokenName(event.params.asset);
    token.symbol = tokenSymbol(event.params.asset);
    token.totalSupply = tokenTotalSupply(event.params.asset);

    token.save();
  }

  tributeProposal.value = event.params.value;
  tributeProposal.proposer = event.params.proposer;
  tributeProposal.status = 'Proposed';

  tributeProposal.save();
}

// TributeProposalCancelled
export function handleTributeProposalCancelled(event: TributeProposalCancelledEvent): void {
  const daoId = event.params.dao.toHexString();
  const tributeId = daoId + '-tribute';
  const tributeProposalId = tributeId + '-' + event.params.proposal.toHexString();

  let tributeProposal = TributeProposal.load(tributeProposalId);

  if (tributeProposal === null) {
    tributeProposal = new TributeProposal(tributeProposalId);
  }

  tributeProposal.status = 'Cancelled';
}
// TributeProposalReleased
export function handleTributeProposalReleased(event: TributeProposalReleasedEvent): void {
  const daoId = event.params.dao.toHexString();
  const tributeId = daoId + '-tribute';
  const tributeProposalId = tributeId + '-' + event.params.proposal.toHexString();

  let tributeProposal = TributeProposal.load(tributeProposalId);

  if (tributeProposal === null) {
    tributeProposal = new TributeProposal(tributeProposalId);
  }

  tributeProposal.status = 'Released';
}
