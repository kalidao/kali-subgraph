import { log, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  KaliDAOFactory,
  DAOdeployed as DaoDeployedEvent
} from "../generated/KaliDAOFactory/KaliDAOFactory"
import { DAO, Token, Member, Proposal} from "../generated/schema"
import { KaliDAO as KaliDAOTemplate} from '../generated/templates'
import { NewProposal as NewProposalEvent, ProposalCancelled as ProposalCancelledEvent, ProposalSponsored as ProposalSponsoredEvent, ProposalProcessed as ProposalProcessedEvent, VoteCast as VoteCastEvent, Approval as ApprovalEvent, DelegateChanged as DelegateChangedEvent, PauseFlipped as PauseFlippedEvent, Transfer as TransferEvent} from '../generated/templates/KaliDAO/KaliDAO'

export function handleDAOdeployed(event: DaoDeployedEvent): void {
  KaliDAOTemplate.create(event.params.kaliDAO)
  let daoId = event.params.kaliDAO.toHexString()
  let dao = new DAO(daoId)
  
  // token
  let tokenId = daoId + '-token-' + event.params.name
  let token = new Token(tokenId)

  token.dao = daoId
  token.name = event.params.name 
  token.symbol = event.params.symbol 
  
  token.save()

  let membersArray = event.params.voters
  let sharesArray = event.params.shares

  for(let i=0; i< membersArray.length; i++) {
    let member = Member.load(membersArray[i].toHexString())
    
    if (member === null) {
      member = new Member(membersArray[i].toHexString())
    }

    member.dao.push(daoId)
    member.shares.push(sharesArray[i])

    member.save()
  }

  dao.founder = event.transaction.from 
  dao.birth = event.block.timestamp 
  dao.docs = event.params.docs 
  dao.paused = event.params.paused 
  dao.quorum = event.params.govSettings[0]
  dao.supermajority = event.params.govSettings[1]

  dao.save()
}
