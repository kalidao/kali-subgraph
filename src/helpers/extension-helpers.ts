import { Address, Bytes } from '@graphprotocol/graph-ts'
import { KaliDAOredemption } from '../../generated/KaliDAOredemption/KaliDAOredemption'

export function getRedeemables(dao: Address): Bytes[] {
  const contract = KaliDAOredemption.bind(dao)

  const redeemables = contract.try_getRedeemables(dao).value
  const redeemablesBytes = redeemables.map<Bytes>((redeemable) => redeemable as Bytes)

  return redeemablesBytes
}
