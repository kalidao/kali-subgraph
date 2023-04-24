import { AccessList, User } from '../../generated/schema'
import {
    AccountListed as AccountListedEvent,
    ListCreated as ListCreatedEvent,
    MerkleRootSet as MerkleRootSetEvent,
    TransferSingle as TransferSingleEvent,
    URI as UriEvent,
} from '../../generated/KaliAccessManager/KaliAccessManager'


export function handleAccountListed(event: AccountListedEvent): void {
    const userId = event.params.id.toString() + '-' + event.params.account.toString() 
    const user = new User(userId)
    user.address = event.params.account
    user.list = event.params.id.toString()
    user.approved = event.params.approved
    user.save()
}

export function handleListCreated(event: ListCreatedEvent): void {
    const listId = event.params.id.toString()
    const accessList = new AccessList(listId)
    
    accessList.creator = event.params.operator

    accessList.save()
}


export function handleMerkleRootSet(event: MerkleRootSetEvent): void {
    const listId = event.params.id.toString()
    const accessList = new AccessList(listId)
    accessList.merkleRoot = event.params.merkleRoot
    accessList.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void {
    
}

export function handleURI(event: UriEvent): void {
    const listId = event.params.id.toString()
    const accessList = new AccessList(listId)
    accessList.uri = event.params.value
    accessList.save()
}