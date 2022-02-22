import { KaliDAO as KaliDAOTemplate } from '../generated/templates';
import { DAOdeployed as DaoDeployedEvent } from '../generated/KaliDAOFactory/KaliDAOFactory';
import { DAO, Token } from '../generated/schema';
import { dataSource, log } from '@graphprotocol/graph-ts';

export function handleDAOdeployed(event: DaoDeployedEvent): void {
  KaliDAOTemplate.create(event.params.kaliDAO);
  const daoId = event.params.kaliDAO.toHexString();
  const dao = new DAO(daoId);

  // token
  const tokenId = daoId + '-token';
  const token = new Token(tokenId);

  token.dao = daoId;
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.paused = event.params.paused;
  token.save();

  dao.founder = event.transaction.from;
  dao.birth = event.block.timestamp;
  dao.docs = event.params.docs;
  dao.votingPeriod = event.params.govSettings[0];
  dao.gracePeriod = event.params.govSettings[1];
  dao.quorum = event.params.govSettings[2];
  dao.supermajority = event.params.govSettings[3];

  // extensions
  // note - this is probably the worst way to do thi
  let extensions = '';
  let extensionsData = '';
  const extensionsArray = event.params.extensions;
  const extensionsBytesArray = event.params.extensionsData;

  for (let i = 0; i < extensionsArray.length; i++) {
    extensions += extensionsArray[i].toHexString() + ',';
    extensionsData += extensionsBytesArray[i].toHexString() + ',';
  }

  dao.extensions = extensions;
  dao.extensionsData = extensionsData;

  dao.save();
}
