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
    latitude?: number,
    longitude?: number,
    userAddress: string
  }) {
    // BACKWARD-COMPATIBLE: return sponsor signature + txBytes (existing behavior)
    const txb = new Transaction();
    const PACKAGE_ID = process.env.PACKAGE_ID!;

    txb.moveCall({
      target: `${PACKAGE_ID}::venue_registry::check_in`,
      arguments: [
        txb.object(params.venueOnChainId),
        txb.pure.vector('u8', Array.from(new TextEncoder().encode(params.imageUrl))),
        txb.pure.string(params.caption),
        txb.pure.u8(params.rating),
        txb.pure.address(params.userAddress), // recipient
        txb.object('0x6'), // clock object
      ],
    });

    // Set gas payment from admin wallet
    const coins = await client.getCoins({
      owner: adminKeypair.getPublicKey().toSuiAddress(),
    });

    txb.setGasPayment(coins.data.map((c: any) => ({
      objectId: c.coinObjectId,
      version: c.version,
      digest: c.digest
    })));

    // For sponsored flow we still set sender to admin (server will submit tx)
    txb.setSender(adminKeypair.getPublicKey().toSuiAddress());
    txb.setGasBudget(10000000); // 0.01 SUI

    // Sign with admin as sender/sponsor and also return bytes/signature
    const { signature, bytes: txBytes } = await txb.sign({
      client,
      signer: adminKeypair,
    });

    return {
      txBytes,
      sponsorSignature: signature,
    };
  },

  /**
   * Execute a server-side check-in (admin wallet submits transaction)
   * Returns the transaction effects and parsed StampMinted event (if any)
   */
  async executeCheckIn(params: {
    venueOnChainId: string,
    imageUrl: string,
    caption: string,
    rating: number,
    latitude?: number,
    longitude?: number,
    userAddress: string
  }) {
    const txb = new Transaction();
    const PACKAGE_ID = process.env.PACKAGE_ID!;

    txb.moveCall({
      target: `${PACKAGE_ID}::venue_registry::check_in`,
      arguments: [
        txb.object(params.venueOnChainId),
        txb.pure.vector('u8', Array.from(new TextEncoder().encode(params.imageUrl))),
        txb.pure.string(params.caption),
        txb.pure.u8(params.rating),
        txb.pure.address(params.userAddress), // recipient
        txb.object('0x6'), // clock
      ],
    });

    const coins = await client.getCoins({ owner: adminKeypair.getPublicKey().toSuiAddress() });
    txb.setGasPayment(coins.data.map((c: any) => ({ objectId: c.coinObjectId, version: c.version, digest: c.digest })));
    txb.setSender(adminKeypair.getPublicKey().toSuiAddress());
    txb.setGasBudget(10000000);

    const { signature, bytes } = await txb.sign({ client, signer: adminKeypair });

    // Submit transaction and wait for effects using executeTransactionBlock
    const result = await client.executeTransactionBlock({ transactionBlock: bytes, signature, options: { showEffects: true, showEvents: true } as any } as any);

    // Try to extract StampMinted event
    let stamped: any = null;
    try {
      const events = (result as any)?.events || [];
      for (const ev of events) {
        // event type may be fully-qualified; check for module::vib_stamp::StampMinted
        const t = (ev?.type || ev?.move_event?.type || '').toString();
        if (t.includes('vib_stamp::StampMinted') || t.includes('vibe_map::vib_stamp::StampMinted')) {
          const fields = ev?.move_event?.fields || ev?.fields || ev?.move_event?.contents || ev?.contents || {};
          stamped = {
            stampId: fields?.stamp_id || fields?.stamp_id?.id || null,
            venueId: fields?.venue_id || null,
            owner: fields?.owner || null,
            visitorNumber: fields?.visitor_number || fields?.visitor_number?.toString?.() || null,
            rarity: fields?.rarity || null,
          };
          break;
        }
      }
    } catch (e) {
      console.warn('[SUI] Failed to parse events', e);
    }

    return { result, stamped };
  }
};
