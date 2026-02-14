import { SuiJsonRpcClient as SuiClient } from '@mysten/sui/jsonRpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  network: 'testnet',
});

// Admin/Gas wallet keypair
const adminKeypair = Ed25519Keypair.deriveKeypair(process.env.BACKEND_WALLET_SEED_PHRASE!);

export const sui = {
  client,
  adminKeypair,
  
  /**
   * Creates a sponsored transaction for minting a stamp
   */
  async createSponsoredCheckIn(params: {
    venueOnChainId: string,
    imageUrl: string,
    caption: string,
    rating: number,
    latitude: number,
    longitude: number,
    userAddress: string
  }) {
    const txb = new Transaction();
    const PACKAGE_ID = process.env.PACKAGE_ID!;
    
    // Multiplier for Move U64 (lat/lng * 1,000,000)
    const latU64 = Math.floor(params.latitude * 1000000);
    const lngU64 = Math.floor(params.longitude * 1000000);

    txb.moveCall({
      target: `${PACKAGE_ID}::venue_registry::check_in`,
      arguments: [
        txb.object(params.venueOnChainId),
        txb.pure.vector('u8', Array.from(new TextEncoder().encode(params.imageUrl))),
        txb.pure.string(params.caption),
        txb.pure.u8(params.rating),
        txb.pure.u64(latU64),
        txb.pure.u64(lngU64),
        txb.object('0x6'), // clock object
      ],
    });

    // Set gas payment from admin wallet
    // We fetch gas coins for the admin wallet
    const coins = await client.getCoins({
      owner: adminKeypair.getPublicKey().toSuiAddress(),
    });

    txb.setGasPayment(coins.data.map((c: any) => ({
      objectId: c.coinObjectId,
      version: c.version,
      digest: c.digest
    })));
    
    txb.setSender(params.userAddress);
    txb.setGasBudget(10000000); // 0.01 SUI

    // Sign with admin as sponsor
    const { signature: sponsorSignature, bytes: txBytes } = await txb.sign({
      client,
      signer: adminKeypair,
    });

    return {
      txBytes,
      sponsorSignature,
    };
  }
};
