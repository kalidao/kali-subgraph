import { Proposal, Token, Tribute, TributeProposal } from '../../generated/schema'
import {
  NewTributeProposal as NewTributeProposalEvent,
  TributeProposalCancelled as TributeProposalCancelledEvent,
  TributeProposalReleased as TributeProposalReleasedEvent,
} from '../../generated/KaliDAOtribute/KaliDAOtribute'
import { tokenName, tokenSymbol, tokenTotalSupply } from '../helpers/token-helpers'
import { ZERO_ADDRESS } from '../helpers/constants'

// NewTributeProposal
export function handleNewTributeProposal(event: NewTributeProposalEvent): void {
  const daoId = event.params.dao.toHexString()
  const tributeId = daoId + '-tribute'
  let tribute = Tribute.load(tributeId)

  if (tribute === null) {
    tribute = new Tribute(tributeId)
  }

  tribute.dao = daoId
  tribute.active = true

  tribute.save()

  const tributeProposalId = tributeId + '-' + event.params.proposal.toHexString()
  const tributeProposal = new TributeProposal(tributeProposalId)
  tributeProposal.asset = event.params.asset
  tributeProposal.isNFT = event.params.nft


  tributeProposal.value = event.params.value
  tributeProposal.proposer = event.params.proposer
  tributeProposal.status = 'Proposed'

  tributeProposal.save()

  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex()
  const proposal = new Proposal(proposalId)
  
  proposal.isTribute = true 
  proposal.tribute = tributeProposalId

  proposal.save()
}

// TributeProposalCancelled
export function handleTributeProposalCancelled(event: TributeProposalCancelledEvent): void {
  const daoId = event.params.dao.toHexString()
  const tributeId = daoId + '-tribute'
  const tributeProposalId = tributeId + '-' + event.params.proposal.toHexString()

  let tributeProposal = TributeProposal.load(tributeProposalId)

  if (tributeProposal === null) {
    tributeProposal = new TributeProposal(tributeProposalId)
  }

  tributeProposal.status = 'Cancelled'
}
// TributeProposalReleased
export function handleTributeProposalReleased(event: TributeProposalReleasedEvent): void {
  const daoId = event.params.dao.toHexString()
  const tributeId = daoId + '-tribute'
  const tributeProposalId = tributeId + '-' + event.params.proposal.toHexString()

  let tributeProposal = TributeProposal.load(tributeProposalId)

  if (tributeProposal === null) {
    tributeProposal = new TributeProposal(tributeProposalId)
  }

  tributeProposal.status = 'Released'
}
