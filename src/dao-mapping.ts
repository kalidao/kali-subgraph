import {
  NewProposal as NewProposalEvent,
  ProposalCancelled as ProposalCancelledEvent,
  ProposalSponsored as ProposalSponsoredEvent,
  ProposalProcessed as ProposalProcessedEvent,
  VoteCast as VoteCastEvent,
  DelegateChanged as DelegateChangedEvent,
  PauseFlipped as PauseFlippedEvent,
  Transfer as TransferEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
} from '../generated/templates/KaliDAO/KaliDAO';
import { Token, Member, Proposal, Vote, Delegate } from '../generated/schema';
import { validateProposalType } from './utils';

export function handleNewProposal(event: NewProposalEvent): void {
  const daoId = event.address.toHexString();
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex();
  const voteId = proposalId + '-vote-' + event.transaction.hash.toHex();

  const proposal = new Proposal(proposalId);
  const vote = new Vote(voteId);

  proposal.dao = daoId;
  proposal.proposer = event.params.proposer;
  proposal.description = event.params.description;
  const proposalType = validateProposalType(event.params.proposalType);
  proposal.proposalType = proposalType;
  proposal.creationTime = event.block.timestamp;
  vote.dao = daoId;
  vote.proposal = proposalId;

  vote.save();
  proposal.save();
}

export function handleProposalProcessed(event: ProposalProcessedEvent): void {
  const daoId = event.address.toHexString();
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex();
  let proposal = Proposal.load(proposalId);

  if (proposal === null) {
    proposal = new Proposal(proposalId);
  }

  proposal.status = event.params.didProposalPass;
  proposal.save();
}

export function handleProposalCancelled(event: ProposalCancelledEvent): void {
  const daoId = event.address.toHexString();
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex();
  let proposal = Proposal.load(proposalId);

  if (proposal === null) {
    proposal = new Proposal(proposalId);
  }

  proposal.proposer = event.params.proposer;
  proposal.status = false;
  proposal.save();
}

export function handleProposalSponsored(event: ProposalSponsoredEvent): void {
  const daoId = event.address.toHexString();
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex();
  let proposal = Proposal.load(proposalId);

  if (proposal === null) {
    proposal = new Proposal(proposalId);
  }

  proposal.sponsor = event.params.sponsor;
  proposal.sponsored = true;

  proposal.save();
}

export function handleVoteCast(event: VoteCastEvent): void {
  const daoId = event.address.toHexString();
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex();
  const voteId = proposalId + '-vote-' + event.transaction.hash.toHex();

  const vote = new Vote(voteId);

  vote.dao = daoId;
  vote.proposal = proposalId;
  vote.voter = event.params.voter;
  vote.vote = event.params.approve;

  vote.save();
}

// kalidao token events
export function handleTransfer(event: TransferEvent): void {
  const daoId = event.address.toHexString();

  const memberFromId = daoId + '-member-' + event.params.from.toHexString();
  const memberToId = daoId + '-member-' + event.params.to.toHexString();

  let memberFrom = Member.load(memberFromId);
  let memberTo = Member.load(memberToId);

  if (memberFrom === null) {
    memberFrom = new Member(memberFromId);
  }

  if (memberTo === null) {
    memberTo = new Member(memberToId);
  }

  memberFrom.shares = memberFrom.shares.minus(event.params.amount);
  memberTo.shares = memberTo.shares.plus(event.params.amount);
  memberTo.address = event.params.to;
  memberTo.dao = daoId;

  memberTo.save();
  memberFrom.save();
}

// export function handleApproval(event: ApprovalEvent): void {}

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  const daoId = event.address.toHexString();
  const memberId = daoId + '-member-' + event.params.delegator.toHexString();
  const delegateId = daoId + '-delegate-' + event.params.toDelegate.toHexString();

  let delegate = Delegate.load(delegateId);

  if (delegate === null) {
    delegate = new Delegate(delegateId);
  }

  let member = Member.load(memberId);

  if (member === null) {
    member = new Member(memberId);
  }

  member.delegate = delegateId;
  delegate.dao = daoId;

  member.save();
  delegate.save();
}

export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {
  const daoId = event.address.toHexString();
  const delegateId = daoId + '-delegate-' + event.params.delegate.toHexString();
  let delegate = Delegate.load(delegateId);

  if (delegate === null) {
    delegate = new Delegate(delegateId);
  }

  delegate.balance = event.params.newBalance;
  delegate.save();
}

export function handlePauseFlipped(event: PauseFlippedEvent): void {
  const daoId = event.address.toHexString();
  const tokenId = daoId + '-token';

  let token = Token.load(tokenId);

  if (token === null) {
    token = new Token(tokenId);
  }

  token.paused = event.params.paused;

  token.save();
}