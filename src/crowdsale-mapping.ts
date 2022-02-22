import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Crowdsale, Purchase } from '../generated/schema';
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
} from '../generated/KaliDAOcrowdsale/KaliDAOcrowdsale';

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString();
  const crowdsaleId = daoId + 'crowdsale';
  const crowdsale = new Crowdsale(crowdsaleId);

  crowdsale.active = true;
  crowdsale.dao = daoId;
  crowdsale.purchaseLimit = event.params.purchaseLimit;
  crowdsale.purchaseMultiplier = event.params.purchaseMultiplier;
  crowdsale.purchaseToken = event.params.purchaseToken;
  crowdsale.saleEnds = event.params.saleEnds;
  crowdsale.details = event.params.details;

  crowdsale.save();
}

// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {
  const daoId = event.params.dao.toHexString();
  const crowdsaleId = daoId + 'crowdsale';
  const purchaserId = crowdsaleId + event.transaction.index.toString();

  const purchase = new Purchase(purchaserId);

  purchase.crowdsale = crowdsaleId;
  purchase.purchaser = event.params.purchaser.toHexString();
  purchase.purchased = event.params.amountOut;

  purchase.save();
}
