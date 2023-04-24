import { BigInt } from '@graphprotocol/graph-ts'
import { Crowdsale, Purchase, Token, Kali } from '../../generated/schema'
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
  ClaimTransferred as ClaimTransferredEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  KaliRateSet as KaliRateSetEvent,
} from '../../generated/KaliDAOcrowdsaleV2/KaliDAOcrowdsaleV2'
import { createToken, tokenName, tokenSymbol, tokenTotalSupply, tokenDecimals } from '../helpers/token-helpers'
import { ZERO_ADDRESS, DEAD_ADDRESS } from '../helpers/constants'

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString()
  const crowdsaleId = daoId + '-crowdsaleV2'
  const crowdsale = new Crowdsale(crowdsaleId)
  crowdsale.dao = daoId
  
  if (event.params.purchaseLimit ==  BigInt.fromI32(0)) {
    crowdsale.active = false 
  } else {
    crowdsale.active = true
  }

  crowdsale.listId = event.params.listId
  if (event.params.listId == BigInt.fromI32(0)) {
    crowdsale.type = 'PUBLIC'
    crowdsale.save()
  } else {
    crowdsale.type = 'LIMITED'
    crowdsale.list = event.params.listId.toString()
    crowdsale.save()
  }

  crowdsale.purchaseTokenAddress = event.params.purchaseAsset 
  if (event.params.purchaseAsset.toString().toLowerCase() === ZERO_ADDRESS) {
    crowdsale.purchaseTokenSymbol = 'ETH'
    crowdsale.purchaseTokenName = 'Ether'
    crowdsale.purchaseTokenDecimals = 18
    crowdsale.save()
  } else if (event.params.purchaseAsset.toString().toLowerCase() === DEAD_ADDRESS) {
    crowdsale.purchaseTokenSymbol = 'WETH'
    crowdsale.purchaseTokenName = 'Wrapped Ether'
    crowdsale.purchaseTokenDecimals = 18
    crowdsale.save()
  } else {
    crowdsale.purchaseTokenName = tokenName(event.params.purchaseAsset)
    crowdsale.purchaseTokenSymbol = tokenSymbol(event.params.purchaseAsset)
    crowdsale.purchaseTokenDecimals = tokenDecimals(event.params.purchaseAsset) as i32
    crowdsale.save()
  }

  crowdsale.version = 2
  crowdsale.purchaseLimit = event.params.purchaseLimit
  crowdsale.purchaseMultiplier = event.params.purchaseMultiplier
  crowdsale.personalLimit = event.params.personalLimit
  crowdsale.saleEnds = event.params.saleEnds
  crowdsale.details = event.params.details
  crowdsale.amountPurchased = BigInt.fromI32(0)

  crowdsale.save()
}

// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {
  const daoId = event.params.dao.toHexString()
  const crowdsaleId = daoId + '-crowdsaleV2'
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

// TODO
export function handleClaimTransferred(event: ClaimTransferredEvent): void {}

// TODO
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {}

// TODO
export function handleKaliRateSet(event: KaliRateSetEvent): void {
  const kaliId = 'kali'
  const kali = new Kali(kaliId)

  kali.swapRate = event.params.kaliRate

  kali.save()
}
