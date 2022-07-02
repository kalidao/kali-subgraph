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

  project.projectID = event.params.project.id
  project.manager = event.params.project.manager
  project.budget = event.params.project.budget
  project.deadline = event.params.project.deadline
  project.goals = event.params.project.goals

  project.save()
}

// ExtensionCalled
export function handleExtensionCalled(event: ExtensionCalledEvent): void {}
