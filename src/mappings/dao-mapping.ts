import { BigInt, Bytes } from '@graphprotocol/graph-ts'
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
  Approval as ApprovalEvent,
} from '../../generated/templates/KaliDAO/KaliDAO'
import { Token, Member, Proposal, Vote, Delegate, DAO } from '../../generated/schema'
import { createToken, getBalance } from '../helpers/token-helpers'
import {
  getQuorum,
  getSupermajority,
  getVotingPeriod,
  getVotingPeriodStarts,
  validateProposalType,
  getVotingWeight,
  getDocs,
} from '../helpers/dao-helpers'
import { tokenTotalSupply } from '../helpers/token-helpers'
import { ZERO_ADDRESS } from '../helpers/constants'

export function handleNewProposal(event: NewProposalEvent): void {
  const daoId = event.address.toHexString()
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex()

  const proposal = new Proposal(proposalId)
  const proposalType = validateProposalType(event.params.proposalType)

  const votingPeriodStarts = getVotingPeriodStarts(event.address, event.params.proposal)

  proposal.dao = daoId
  proposal.serial = event.params.proposal
  proposal.transactionHash = event.transaction.hash
  proposal.proposalType = proposalType
  proposal.proposer = event.params.proposer
  proposal.description = event.params.description
  proposal.creationTime = event.block.timestamp
  proposal.votingStarts = votingPeriodStarts

  // Proposal Arrays
  proposal.accounts = event.params.accounts.map<Bytes>((address) => address as Bytes)
  proposal.amounts = event.params.amounts.map<BigInt>((amount) => amount as BigInt)
  proposal.payloads = event.params.payloads.map<Bytes>((payload) => payload as Bytes)

  if (votingPeriodStarts > BigInt.fromI32(0)) {
    proposal.sponsored = true
  } else {
    proposal.sponsored = false
  }

  proposal.save()
}

function getProposalIdBySerial(daoId: string, serial: BigInt): string {
  const id = daoId + '-proposal-' + serial.toHex()
  return id
}

export function handleProposalProcessed(event: ProposalProcessedEvent): void {
  const daoId = event.address.toHexString()

  const proposalId = getProposalIdBySerial(daoId, event.params.proposal)
  let proposal = Proposal.load(proposalId)

  // TODO handle ESCAPE proposal processing
  // ref: https://discord.com/channels/923399898769018921/925091695677309059/1042853317748985917
  // ref: https://github.com/SporosDAO/sweat-token/pull/174#issuecomment-1317455373

  if (proposal === null) {
    proposal = new Proposal(proposalId)
  }

  proposal.status = event.params.didProposalPass
  proposal.save()

  if (event.params.didProposalPass) {
    const daoId = event.address.toHexString()
    const dao = new DAO(daoId)
    const token = new Token(daoId + '-token')
    // TODO: Fetch other data from the DAO contract as well
    // fetching all if passed because conditional isn't working???!
    dao.quorum = getQuorum(event.address)
    dao.votingPeriod = getVotingPeriod(event.address)
    dao.supermajority = getSupermajority(event.address)
    dao.docs = getDocs(event.address)
    dao.save()

    // Handle status update of an ESCAPEd (deleted) proposal
    if (proposal.proposalType == 'ESCAPE') {
      // retrieve targeted proposal for ESCAPE(deletion)
      // an ESCAPE proposal must always have a non-null amounts array with its first element referring to the ESCAPED proposal
      if (proposal.amounts !== null && proposal.amounts!.length > 0) {
        let escapedProposalSerial = proposal.amounts![0]
        if (escapedProposalSerial) {
          // set flag to ESCAPED
          const escapedProposalId = getProposalIdBySerial(daoId, escapedProposalSerial)
          let escapedProposal = Proposal.load(escapedProposalId)
          if (escapedProposal) {
            escapedProposal.escaped = true
            // save changes
            escapedProposal.save()
          }
        }
      }
    }
  }
}

export function handleProposalCancelled(event: ProposalCancelledEvent): void {
  const daoId = event.address.toHexString()
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex()
  let proposal = Proposal.load(proposalId)

  if (proposal === null) {
    proposal = new Proposal(proposalId)
  }

  proposal.proposer = event.params.proposer
  proposal.cancelled = true

  proposal.save()
}

export function handleProposalSponsored(event: ProposalSponsoredEvent): void {
  const daoId = event.address.toHexString()
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex()
  let proposal = Proposal.load(proposalId)

  if (proposal === null) {
    proposal = new Proposal(proposalId)
  }
  const votingPeriodStarts = getVotingPeriodStarts(event.address, event.params.proposal)

  proposal.votingStarts = votingPeriodStarts
  proposal.sponsor = event.params.sponsor
  proposal.sponsored = true

  proposal.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
  const daoId = event.address.toHexString()
  const proposalId = daoId + '-proposal-' + event.params.proposal.toHex()
  const voteId = proposalId + '-vote-' + event.transaction.hash.toHex()

  const vote = new Vote(voteId)

  vote.dao = daoId
  vote.proposal = proposalId
  vote.voter = event.params.voter
  vote.vote = event.params.approve
  vote.weight = getVotingWeight(event.address, event.params.proposal, event.params.voter)

  vote.save()
}

// kalidao token events
export function handleTransfer(event: TransferEvent): void {
  const daoId = event.address.toHexString()

  // Minting
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    const memberId = daoId + '-member-' + event.params.to.toHexString()
    let member = Member.load(memberId)

    if (member === null) {
      member = new Member(memberId)
      member.shares = BigInt.fromI32(0)
      member.dao = daoId
      member.address = event.params.to
    }

    let token = Token.load(daoId + '-token')

    if (token === null) {
      token = createToken(event.address)
    }

    member.shares = member.shares.plus(event.params.amount)
    member.save()
    token.totalSupply = tokenTotalSupply(event.address)
    token.save()

    // Burn
  } else if (event.params.to.toHexString() == ZERO_ADDRESS) {
    const memberId = daoId + '-member-' + event.params.from.toHexString()
    let member = Member.load(memberId)

    if (member === null) {
      member = new Member(memberId)
      member.shares = BigInt.fromI32(0)
      member.dao = daoId
      member.address = event.params.from
    }

    let token = Token.load(daoId + '-token')

    if (token === null) {
      token = createToken(event.address)
    }
    token.totalSupply = tokenTotalSupply(event.address)
    member.shares = member.shares.minus(event.params.amount)
    member.save()
    token.save()
  } else {
    const memberFromId = daoId + '-member-' + event.params.from.toHexString()
    const memberToId = daoId + '-member-' + event.params.to.toHexString()
    let memberFrom = Member.load(memberFromId)
    let memberTo = Member.load(memberToId)

    if (memberFrom === null) {
      memberFrom = new Member(memberFromId)
      memberFrom.dao = daoId
      memberFrom.address = event.params.from
    }

    if (memberTo === null) {
      memberTo = new Member(memberToId)
      memberTo.dao = daoId
      memberTo.address = event.params.to
    }

    memberFrom.shares = getBalance(event.address, event.params.from)
    memberTo.shares = getBalance(event.address, event.params.to)

    let token = Token.load(daoId + '-token')

    if (token === null) {
      token = createToken(event.address)
    }
    token.totalSupply = tokenTotalSupply(event.address)
    token.save()
    memberFrom.save()
    memberTo.save()
  }
}

export function handleApproval(event: ApprovalEvent): void {
  const daoId = event.address.toHexString()
  const memberId = daoId + '-member-' + event.params.owner.toHexString()
  let member = Member.load(memberId)

  if (member === null) {
    member = new Member(memberId)
  }

  member.approval = true
  member.amountApproved = event.params.amount

  member.save()
}

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  const daoId = event.address.toHexString()
  const memberId = daoId + '-member-' + event.params.delegator.toHexString()
  const delegateId = daoId + '-delegate-' + event.params.toDelegate.toHexString()

  let delegate = Delegate.load(delegateId)

  if (delegate === null) {
    delegate = new Delegate(delegateId)
  }

  let member = Member.load(memberId)

  if (member === null) {
    member = new Member(memberId)
  }

  member.delegate = delegateId
  member.save()

  delegate.dao = daoId
  delegate.save()
}

export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {
  const daoId = event.address.toHexString()
  const delegateId = daoId + '-delegate-' + event.params.delegate.toHexString()
  let delegate = Delegate.load(delegateId)

  if (delegate === null) {
    delegate = new Delegate(delegateId)
  }

  delegate.dao = daoId
  delegate.balance = event.params.newBalance
  delegate.save()
}

export function handlePauseFlipped(event: PauseFlippedEvent): void {
  const daoId = event.address.toHexString()
  const tokenId = daoId + '-token'

  let token = Token.load(tokenId)

  if (token === null) {
    token = createToken(event.address)
  }

  token.paused = event.params.paused

  token.save()
}
