import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Crowdsale, Purchase, Token } from '../generated/schema';
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
  KaliDAOcrowdsale,
} from '../generated/KaliDAOcrowdsale/KaliDAOcrowdsale';
import { createToken, tokenTotalSupply } from './token-helpers';

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString();
  const crowdsaleId = daoId + '-crowdsale';
  const crowdsale = new Crowdsale(crowdsaleId);

  crowdsale.active = true;
  crowdsale.dao = daoId;
  crowdsale.purchaseLimit = event.params.purchaseLimit;
  crowdsale.purchaseMultiplier = event.params.purchaseMultiplier;
  crowdsale.purchaseToken = event.params.purchaseToken;
  crowdsale.saleEnds = event.params.saleEnds;
  crowdsale.details = event.params.details;
  crowdsale.listId = event.params.listId;
  crowdsale.amountPurchased = BigInt.fromI32(0);

  crowdsale.save();
}

// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {
  const daoId = event.params.dao.toHexString();
  const crowdsaleId = daoId + '-crowdsale';
  const purchaserId = crowdsaleId + event.transaction.index.toString();

  let crowdsale = Crowdsale.load(crowdsaleId);

  if (crowdsale === null) {
    crowdsale = new Crowdsale(crowdsaleId);
    crowdsale.active = true;
    crowdsale.dao = daoId;
  }

  if (crowdsale.amountPurchased === null) {
    crowdsale.amountPurchased = BigInt.fromI32(0);
  }

  crowdsale.amountPurchased = crowdsale.amountPurchased.plus(event.params.amountOut);
  crowdsale.save();

  const purchase = new Purchase(purchaserId);
  purchase.crowdsale = crowdsaleId;
  purchase.purchaser = event.params.purchaser;

  if (!purchase.purchased) {
    purchase.purchased = BigInt.fromI32(0);
  }

  purchase.purchased = purchase.purchased.plus(event.params.amountOut);
  purchase.save();

  const tokenId = daoId + '-token';
  let token = Token.load(tokenId);

  if (token === null) {
    token = createToken(event.params.dao);
  }

  token.totalSupply = tokenTotalSupply(event.params.dao);

  token.save();
}

// Helpers
export function getAmountPurchased(contractAddress: Address, dao: Address): BigInt {
  const crowdsale = KaliDAOcrowdsale.bind(contractAddress);
  const totalAmountPurchased = crowdsale.try_crowdsales(dao);

  if (totalAmountPurchased.reverted) {
    log.error('getCrowdsales reverted at {}', [dao.toHexString()]);
  }

  return totalAmountPurchased.value.value4 as BigInt;
}
