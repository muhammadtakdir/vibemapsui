import { SuiJsonRpcClient as SuiClient } from '@mysten/sui/jsonRpc';
import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
	testnet: {
		url: 'https://fullnode.testnet.sui.io:443',
		network: 'testnet',
	},
	mainnet: {
		url: 'https://fullnode.mainnet.sui.io:443',
		network: 'mainnet',
	},
});

export { networkConfig, useNetworkVariable, useNetworkVariables };

export const suiClient = new SuiClient({ url: networkConfig.testnet.url!, network: 'testnet' });
