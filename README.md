# Subgraph for KALI

Kali provides subgraph scheme for multiple EVM networks. In order to test and deploy for a particular network, follow the instructions below:

# Prepare subgraph.yaml for a given EVM network

For example to prepare the subgraph scripts for Goerli, use the following command:

`yarn prepare:goerli`

# Generate code

Generate code from schema and config inputs:

`yarn codegen`

# Build binaries

Build WASM binaries from source code:

`yarn build`

# Deploy to Studio sandbox

It is convenient to use the Graph Studio sandbox environment for development and testing of subgraph code.
https://thegraph.com/studio

First create an account and register a project under `Goerli` test net with a unique slug such as `kalidao-myfork`

At registration of your new Studio project, you will get a deployment key. Studio will provide instructions that look like this:

After registration, Studio will provide you with something that looks like this:
`graph auth --studio <YOUR_DEPLOY_KEY>`

Save the unique project name and deployment key in your local environment or workspace private variables. For Gitpod, use [Account Settings](https://www.gitpod.io/docs/configure/projects/environment-variables#using-the-account-settings)

Your new Studio project name and API Key should be available as local environment variables named `GRAPH_STUDIO_PROJECT` and `GRAPH_STUDIO_DEPLOYKEY`.

When ready to deploy new subgraph code:

```bash
yarn auth:studio
yarn deploy:studio
```


> After running this command, the CLI will ask for a version label, you can name it however you want, you can use labels such as 0.1 and 0.2 or use letters as well such as uniswap-v2-0.1. Those labels will be visible in Graph Explorer and can be used by curators to decide if they want to signal on this version or not, so choose them wisely.
>
> Once deployed, you can test your subgraph in Subgraph Studio using the playground, deploy another version if needed, update the metadata, and when you are ready, publish your subgraph to Graph Explorer.

Additional documentation about Graph Studio is available [here](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-studio/#deploying-a-subgraph-to-subgraph-studio).

# Deploy to local Graph Node

Alternatively, a local Graph Node can be installed for development and testing. It takes some additional admin skills and effort, but gives you full visibility of the Graph stack. Detailed setup instructions here:
https://github.com/graphprotocol/graph-node

Once a local node is installed and running, you can deploy to it via:

```bash
yarn create-local
yarn deploy-local
```

# Deploy to a target live network

When the code is tested in Graph Studio or a local node, you can deploy it to a live target network. For example to deploy to Goerli:

```bash
yarn deploy-goerli
```

## Active Deployments

Bellow if a list of active live deployments of the Kali DAO subgraph that can be used by front end apps:

- [Mainnet](https://thegraph.com/hosted-service/subgraph/nerderlyne/kali-mainnet)
- [Arbitrum](https://thegraph.com/hosted-service/subgraph/nerderlyne/kali-arbitrum)
- [Polygon](https://thegraph.com/hosted-service/subgraph/nerderlyne/kali-matic)
- [Optimism](https://thegraph.com/hosted-service/subgraph/nerderlyne/kali-optimism)
- [Gnosis](https://thegraph.com/hosted-service/subgraph/nerderlyne/kali-gnosis)
