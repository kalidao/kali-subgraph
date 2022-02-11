import { log, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  KaliDAOFactory,
  DAOdeployed as DaoDeployedEvent,
} from "../generated/KaliDAOFactory/KaliDAOFactory";
import { DAO, Token, Member, Proposal, Vote } from "../generated/schema";
import { KaliDAO as KaliDAOTemplate } from "../generated/templates";
import {
  NewProposal as NewProposalEvent,
  ProposalCancelled as ProposalCancelledEvent,
  ProposalSponsored as ProposalSponsoredEvent,
  ProposalProcessed as ProposalProcessedEvent,
  VoteCast as VoteCastEvent,
  // Approval as ApprovalEvent,
  DelegateChanged as DelegateChangedEvent,
  PauseFlipped as PauseFlippedEvent,
  Transfer as TransferEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
} from "../generated/templates/KaliDAO/KaliDAO";

export function handleDAOdeployed(event: DaoDeployedEvent): void {
  KaliDAOTemplate.create(event.params.kaliDAO);
  let daoId = event.params.kaliDAO.toHexString();
  let dao = new DAO(daoId);

  // token
  let tokenId = daoId + "-token";
  let token = new Token(tokenId);

  token.dao = daoId;
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.paused = event.params.paused;
  token.save();

  let membersArray = event.params.voters;
  let sharesArray = event.params.shares;

  for (let i = 0; i < membersArray.length; i++) {
    let memberId = daoId + "-member-" + membersArray[i].toHexString();
    let member = new Member(memberId);

    member.dao = daoId;
    member.address = membersArray[i];
    member.shares = sharesArray[i];
    member.save();
  }

  dao.founder = event.transaction.from;
  dao.birth = event.block.timestamp;
  dao.docs = event.params.docs;
  dao.votingPeriod = event.params.govSettings[0];
  dao.gracePeriod = event.params.govSettings[1];
  dao.quorum = event.params.govSettings[2];
  dao.supermajority = event.params.govSettings[3];

  // extensions
  // note - this is probably the worst way to do this
  let extensions: string = "";
  let extensionsData: string = "";
  let extensionsArray = event.params.extensions;
  let extensionsBytesArray = event.params.extensionsData;

  for (let i = 0; i < extensionsArray.length; i++) {
    extensions += extensionsArray[i].toHexString() + ",";
    extensionsData += extensionsBytesArray[i].toHexString() + ",";
  }

  dao.extensions = extensions;
  dao.extensionsData = extensionsData;
  dao.save();
}

// proposal events
export function handleNewProposal(event: NewProposalEvent): void {
  let daoId = event.address.toHexString();
  let proposalId = daoId + "-proposal-" + event.params.proposal.toHex();
  let voteId = proposalId + "-vote-" + event.transaction.hash.toHex();

  let proposal = new Proposal(proposalId);
  let vote = new Vote(voteId);

  proposal.dao = daoId;
  proposal.proposer = event.params.proposer;
  proposal.description = event.params.description;
  proposal.type = event.params.proposalType.toString();

  vote.dao = daoId;
  vote.proposal = proposalId;

  vote.save();
  proposal.save();
}

export function handleProposalProcessed(event: ProposalProcessedEvent): void {
  let daoId = event.address.toHexString();
  let proposalId = daoId + "-proposal-" + event.params.proposal.toHex();
  let proposal = Proposal.load(proposalId);

  if (proposal == null) {
    proposal = new Proposal(proposalId);
  }

  proposal.status = event.params.didProposalPass;
  proposal.save();
}

export function handleProposalCancelled(event: ProposalCancelledEvent): void {
  let daoId = event.address.toHexString();
  let proposalId = daoId + "-proposal-" + event.params.proposal.toHex();
  let proposal = Proposal.load(proposalId);

  if (proposal == null) {
    proposal = new Proposal(proposalId);
  }

  proposal.proposer = event.params.proposer;
  proposal.status = false;
  proposal.save();
}

export function handleProposalSponsored(event: ProposalSponsoredEvent): void {
  let daoId = event.address.toHexString();
  let proposalId = daoId + "-proposal-" + event.params.proposal.toHex();
  let proposal = Proposal.load(proposalId);

  if (proposal == null) {
    proposal = new Proposal(proposalId);
  }

  proposal.sponsor = event.params.sponsor;
  proposal.sponsored = true;
  proposal.save();
}

export function handleVoteCast(event: VoteCastEvent): void {
  let daoId = event.address.toHexString();
  let proposalId = daoId + "-proposal-" + event.params.proposal.toHex();
  let voteId = proposalId + "-vote-" + event.transaction.hash.toHex();

  let vote = new Vote(voteId);

  vote.dao = daoId;
  vote.proposal = proposalId;
  vote.voter = event.params.voter;
  vote.vote = event.params.approve;

  vote.save();
}

// kalidao token events
export function handleTransfer(event: TransferEvent): void {
  let daoId = event.address.toHexString();

  let memberFromId = daoId + "-member-" + event.params.from.toHexString();
  let memberToId = daoId + "-member-" + event.params.to.toHexString();

  let memberFrom = Member.load(memberFromId);
  let memberTo = Member.load(memberToId);

  if (memberFrom == null) {
    memberFrom = new Member(memberFromId);
  }

  if (memberTo == null) {
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

export function handleDelegateChanged(event: DelegateChangedEvent): void {}

export function handleDelegateVotesChanged(
  event: DelegateVotesChangedEvent
): void {}

export function handlePauseFlipped(event: PauseFlippedEvent): void {
  let daoId = event.address.toHexString();
  let tokenId = daoId + "-token";

  let token = Token.load(tokenId);

  if (token == null) {
    token = new Token(tokenId);
  }

  token.paused = event.params.paused;

  token.save();
}
