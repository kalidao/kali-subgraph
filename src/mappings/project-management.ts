import { Bytes } from '@graphprotocol/graph-ts'
import { Project } from '../../generated/schema'
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
} from '../../generated/ProjectManagement/ProjectManagement'

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString()
  const projectId = daoId + '-project'
  const project = new Project(projectId)

  project.active = true
  project.dao = daoId
  project.serial = event.params.project[0].toBigInt()
  project.manager = event.params.project[2].toBytes()
  project.budget = event.params.project[3].toBigInt()
  project.deadline = event.params.project[4].toBigInt()
  project.goals = event.params.project[5].toString()

  project.save()
}

// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {}
