module vibe_map::vib_stamp {
    use sui::url::{Self, Url};
    use std::string::{String};
    use sui::event;
    use sui::clock::{Clock};

    /// Rarity constants
    const GOLD: u8 = 1;
    const SILVER: u8 = 2;
    const BRONZE: u8 = 3;

    public struct VibStamp has key, store {
        id: UID,
        venue_id: ID,
        visitor_number: u64,
        rarity: u8,
        image_url: Url,
        caption: String,
        rating: u8,
        latitude: u64,
        longitude: u64,
        timestamp: u64,
    }

    public struct StampMinted has copy, drop {
        stamp_id: ID,
        venue_id: ID,
        owner: address,
        visitor_number: u64,
        rarity: u8,
    }

    public(package) fun mint_internal(
        venue_id: ID,
        visitor_number: u64,
        image_url: vector<u8>,
        caption: String,
        rating: u8,
        latitude: u64,
        longitude: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): VibStamp {
        let rarity = if (visitor_number == 1) {
            GOLD
        } else if (visitor_number <= 10) {
            SILVER
        } else {
            BRONZE
        };

        let id = object::new(ctx);
        let stamp_id = id.to_inner();
        let owner = ctx.sender();

        let stamp = VibStamp {
            id,
            venue_id,
            visitor_number,
            rarity,
            image_url: url::new_unsafe_from_bytes(image_url),
            caption,
            rating,
            latitude,
            longitude,
            timestamp: clock.timestamp_ms(),
        };

        event::emit(StampMinted {
            stamp_id,
            venue_id,
            owner,
            visitor_number,
            rarity,
        });

        stamp
    }

    public fun burn(stamp: VibStamp) {
        let VibStamp { id, .. } = stamp;
        object::delete(id);
    }

    // Getters
    public fun visitor_number(stamp: &VibStamp): u64 { stamp.visitor_number }
    public fun rarity(stamp: &VibStamp): u8 { stamp.rarity }
}
