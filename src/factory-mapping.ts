import { KaliDAO as KaliDAOTemplate } from '../generated/templates';
import { DAOdeployed as DaoDeployedEvent } from '../generated/KaliDAOFactory/KaliDAOFactory';
import { DAO, Token, Tribute } from '../generated/schema';
import { Bytes, dataSource, log } from '@graphprotocol/graph-ts';
import { KaliDAO } from '../generated/templates/KaliDAO/KaliDAO';

export function handleDAOdeployed(event: DaoDeployedEvent): void {
  KaliDAOTemplate.create(event.params.kaliDAO);
  const daoId = event.params.kaliDAO.toHexString();
  const dao = new DAO(daoId);

  //
  const contract = KaliDAO.bind(event.params.kaliDAO);

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
  dao.address = event.params.kaliDAO;
  dao.extensions = event.params.extensions.map<Bytes>((ext) => ext as Bytes);

  const network = dataSource.network();
  log.error('network: {}', [network]);
  dao.save();

  const tributeId = daoId + '-tribute';
  const tribute = new Tribute(tributeId);
  tribute.dao = daoId;
  tribute.active = true;
  tribute.save();
}
