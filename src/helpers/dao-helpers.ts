import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { KaliDAO } from '../../generated/templates/KaliDAO/KaliDAO'

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
  ]

  return proposalTypes[type]
}

export function getSupermajority(dao: Address): BigInt {
  const contract = KaliDAO.bind(dao)

  const supermajority = contract.try_supermajority()

  if (supermajority.reverted) {
    log.error('Supermajority revert. Address - {}', [dao.toHexString()])
  }

  return supermajority.value as BigInt
}

export function getQuorum(dao: Address): BigInt {
  const contract = KaliDAO.bind(dao)

  const quorum = contract.try_quorum()

  if (quorum.reverted) {
    log.error('Quorum revert. Address - {}', [dao.toHexString()])
  }

  return quorum.value as BigInt
}

export function getVotingPeriod(dao: Address): BigInt {
  const contract = KaliDAO.bind(dao)

  const votingPeriod = contract.try_votingPeriod()

  if (votingPeriod.reverted) {
    log.error('Voting Period revert. Address - {}', [dao.toHexString()])
  }

  return votingPeriod.value as BigInt
}

export function getDocs(dao: Address): string {
  const contract = KaliDAO.bind(dao)

  const docs = contract.try_docs()

  if (docs.reverted) {
    log.error('Docs revert. Address - {}', [dao.toHexString()])
  }

  return docs.value as string
}
