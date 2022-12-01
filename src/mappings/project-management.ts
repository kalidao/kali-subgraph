import { ethereum, log } from '@graphprotocol/graph-ts'
import { Project, Contribution } from '../../generated/schema'
import {
  ExtensionSet as ExtensionSetEvent,
  ExtensionCalled as ExtensionCalledEvent,
} from '../../generated/ProjectManagement/ProjectManagement'

// ExtensionSet
export function handleExtensionSet(event: ExtensionSetEvent): void {
  const daoId = event.params.dao.toHexString()
  const projectId = daoId + '-project-' + event.params.project.id.toString()
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
export function handleExtensionCalled(event: ExtensionCalledEvent): void {
  const daoId = event.params.dao.toHexString()

  for (let i = 0; i < event.params.updates.length; i++) {
    const decoded = ethereum.decode('(uint256,address,uint256,string)', event.params.updates[i])
    if (decoded !== null) {
      const updates = decoded.toTuple()
      const projectId = daoId + '-project-' + updates[0].toString()
      const contributionId = projectId + '-contribution-' + updates[1].toString()
      const contribution = new Contribution(contributionId)

      contribution.project = updates[0].toString()
      contribution.contributor = updates[1].toAddress()
      contribution.remuneration = updates[2].toBigInt()
      contribution.tribute = updates[4].toString()

      log.info(
        'Project decoded. DAO - {}, Tx Hash - {}, project - {}, contributor - {}, remuneration - {}, tribute - {}',
        [
          event.params.dao.toString(),
          event.transaction.hash.toString(),
          updates[0].toString(),
          updates[1].toString(),
          updates[2].toString(),
          updates[4].toString(),
        ],
      )

      contribution.save()
    } else {
      log.info('Project not decoded. DAO - {}, Tx Hash - {} ', [
        event.params.dao.toString(),
        event.transaction.hash.toString(),
      ])
    }
  }
}
