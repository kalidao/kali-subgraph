import { BigInt } from "@graphprotocol/graph-ts"
import {
  KaliDAOFactory,
  DAOdeployed
} from "../generated/KaliDAOFactory/KaliDAOFactory"
import { DAO, User } from "../generated/schema"
import { KaliDAO } from '../generated/templates'

export function handleDAOdeployed(event: DAOdeployed): void {
  // KaliDAO.create(event.params.kaliDAO)

  // let kali = Kali.load(event.transaction.from.toHex() + "-" + event.logIndex.toString())

  // if (!kali) {
  //   kali = new Kali(event.transaction.from.toHex() + "-" + event.logIndex.toString())
  // }
  
  // kali.founder = event.transaction.from.toHex()
  // kali.daoAddress = event.params.kaliDAO
  // kali.name = event.params.name

  // kali.save()
}
