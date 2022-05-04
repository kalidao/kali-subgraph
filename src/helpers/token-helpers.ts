import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Erc20 } from '../../generated/KaliDAOFactory/Erc20';
import { Token } from '../../generated/schema';

export function createToken(dao: Address): Token {
  const tokenId = dao.toHexString() + '-token';
  let token = Token.load(tokenId);

  if (token === null) {
    token = new Token(tokenId);
  }

  token.dao = dao.toHexString();
  token.name = tokenName(dao);
  token.symbol = tokenSymbol(dao);
  token.totalSupply = tokenTotalSupply(dao);

  log.error('token of {}', [dao.toHexString()]);

  return token as Token;
}

export function tokenName(address: Address): string {
  let contract = Erc20.bind(address);

  let name = contract.try_name();

  if (name.reverted) {
    log.error('Name revert. Address - {}', [address.toHexString()]);
  }

  return name.value;
}

export function tokenSymbol(address: Address): string {
  let contract = Erc20.bind(address);

  let symbol = contract.try_symbol();

  if (symbol.reverted) {
    log.error('Symbol revert. Address - {}', [address.toHexString()]);
  }

  return symbol.value;
}

export function tokenTotalSupply(address: Address): BigInt {
  const contract = Erc20.bind(address);

  let totalSupply = contract.try_totalSupply();
  if (totalSupply.reverted) {
    log.error('Total Supply revert. Address - {}', [address.toHexString()]);
  }

  return totalSupply.value;
}

export function getBalance(contractAddress: Address, address: Address): BigInt {
  const contract = Erc20.bind(contractAddress);
  let balance = contract.try_balanceOf(address);

  if (balance.reverted) {
    log.error('balanceOf reverted at contract {} for account {}', [
      contractAddress.toHexString(),
      address.toHexString(),
    ]);
  }

  return balance.value;
}
