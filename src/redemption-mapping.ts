import { Quit, Redemption } from '../generated/schema';
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
  TokensAdded as TokensAddedEvent,
  TokensRemoved as TokensRemovedEvent,
} from '../generated/KaliDAOredemption/KaliDAOredemption';

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString();
  const redemptionId = daoId + '-redemption';
  const redemption = new Redemption(redemptionId);

  redemption.active = true;
  // redemption.redeemables = event.params.tokens;
  redemption.starts = event.params.redemptionStart;

  redemption.save();
}
// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {
  const daoId = event.params.dao.toHexString();
  const memberId = daoId + '-member-' + event.params.member.toHexString();
  const redemptionId = daoId + '-redemption';
  const quitId = memberId + redemptionId;
  let quit = new Quit(quitId);

  quit.member = memberId;
  quit.amount = event.params.amountBurned;

  quit.save();
}
// TokenAdded
export function handleTokenAdded(event: TokensAddedEvent): void {
  //   const daoId = event.params.dao.toHexString();
  //   const redemptionId = daoId + '-redemption';
  //   let redemption = Redemption.load(redemptionId);
  //   if (redemption === null) {
  //     redemption = new Redemption(redemptionId);
  //   }
  //   redemption.redeemables = event.params.tokens;
  //   redemption.save();
}

// Token Removed
export function handleTokenRemoved(event: TokensRemovedEvent): void {
  //   const daoId = event.params.dao.toHexString();
  //   const redemptionId = daoId + '-redemption';
  //   let redemption = Redemption.load(redemptionId);
  //   if (redemption === null) {
  //     redemption = new Redemption(redemptionId);
  //   }
  //   if (redemption.redeemables != null) {
  //     const tokenIndex = event.params.tokenIndex;
  //     const redeemables = redemption.redeemables;
  //     const redeem = [];
  //     for (let i = 0; i < tokenIndex.length; i++) {
  //       redeem.push(redeemables[tokenIndex[i].toI32()]);
  //     }
  //     redemption.redeemed = redeem;
  //   }
  //   redemption.save();
}
