import { BigInt } from "@graphprotocol/graph-ts"
import {
  KaliDAOFactory,
  DAOdeployed
} from "../generated/KaliDAOFactory/KaliDAOFactory"
import { Kali } from "../generated/schema"

export function handleDAOdeployed(event: DAOdeployed): void {
  let kali = Kali.load(event.transaction.from.toHex())

  if (!kali) {
    kali = new Kali(event.transaction.from.toHex())
  }

  kali.address = event.params.kaliDAO
  kali.name = event.params.name

  kali.save()
}
