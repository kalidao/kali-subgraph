import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { Erc20 } from '../../generated/KaliDAOFactory/Erc20'
import { Token } from '../../generated/schema'

export function createToken(dao: Address): Token {
  const tokenId = dao.toHexString() + '-token'
  let token = Token.load(tokenId)

  if (token === null) {
    token = new Token(tokenId)
  }

  token.dao = dao.toHexString()
  token.name = tokenName(dao)
  token.symbol = tokenSymbol(dao)
  token.totalSupply = tokenTotalSupply(dao)

  log.info('token of {}', [dao.toHexString()])

  return token as Token
}

export function tokenName(address: Address): string | null {
  let contract = Erc20.bind(address)

  let name = 'Unknown'
  let result = contract.try_name()

  if (result.reverted) {
    log.info('Name revert. Address - {}', [address.toHexString()])
  } else {
    name = result.value
  }

  return name
}

export function tokenSymbol(address: Address): string | null {
  let contract = Erc20.bind(address)
  let symbol = 'UNKNOWN'
  let result = contract.try_symbol()
  if (result.reverted) {
    log.info('Symbol revert. Address - {}', [address.toHexString()])
  } else {
    symbol = result.value
  }

  return symbol
}

export function tokenTotalSupply(address: Address): BigInt {
  const contract = Erc20.bind(address)

  let totalSupply = BigInt.fromI32(0)
  let result = contract.try_totalSupply()
  if (result.reverted) {
    log.info('Total Supply revert. Address - {}', [address.toHexString()])
  } else {
    totalSupply = result.value
  }

  return totalSupply
}

export function getBalance(contractAddress: Address, address: Address): BigInt {
  const contract = Erc20.bind(contractAddress)

  let balance = BigInt.fromI32(0)
  let result = contract.try_balanceOf(address)

  if (result.reverted) {
    log.info('balanceOf reverted at contract {} for account {}', [contractAddress.toHexString(), address.toHexString()])
  } else {
    balance = result.value
  }

  return balance
}
