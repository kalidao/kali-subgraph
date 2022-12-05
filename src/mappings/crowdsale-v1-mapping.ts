import { BigInt } from '@graphprotocol/graph-ts'
import { Crowdsale, Purchase, Token } from '../../generated/schema'
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
} from '../../generated/KaliDAOcrowdsaleV1/KaliDAOcrowdsaleV1'
import { createToken, tokenTotalSupply } from '../helpers/token-helpers'

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString()
  const crowdsaleId = daoId + '-crowdsaleV1'
  const crowdsale = new Crowdsale(crowdsaleId)

  crowdsale.active = true
  crowdsale.dao = daoId
  crowdsale.version = 1
  crowdsale.purchaseLimit = event.params.purchaseLimit
  crowdsale.purchaseMultiplier = BigInt.fromI32(event.params.purchaseMultiplier)
  crowdsale.purchaseTokenAddress = event.params.purchaseToken
  crowdsale.saleEnds = event.params.saleEnds
  crowdsale.details = event.params.details
  crowdsale.listId = event.params.listId
  crowdsale.amountPurchased = BigInt.fromI32(0)

  crowdsale.save()
}

// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {
  const daoId = event.params.dao.toHexString()
  const crowdsaleId = daoId + '-crowdsaleV1'
  const purchaseId = crowdsaleId + event.transaction.index.toString()

  let crowdsale = Crowdsale.load(crowdsaleId)

  if (crowdsale === null) {
    crowdsale = new Crowdsale(crowdsaleId)
    crowdsale.active = true
    crowdsale.dao = daoId
  }

  if (crowdsale.amountPurchased === null) {
    crowdsale.amountPurchased = BigInt.fromI32(0)
  }

  crowdsale.amountPurchased = crowdsale.amountPurchased.plus(event.params.amountOut)
  crowdsale.save()

  const purchase = new Purchase(purchaseId)
  purchase.crowdsale = crowdsaleId
  purchase.purchaser = event.params.purchaser
  purchase.purchased = event.params.amountOut

  purchase.save()

  const tokenId = daoId + '-token'
  let token = Token.load(tokenId)

  if (token === null) {
    token = createToken(event.params.dao)
  }

  token.totalSupply = tokenTotalSupply(event.params.dao)

  token.save()
}
