import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Erc20 } from '../generated/KaliDAOFactory/Erc20';

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

export function tokenTotalSupply(address: Address): BigInt | null {
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
