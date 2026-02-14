module vibe_map::venue_registry {
    use std::string::{String};
    use sui::event;
    use vibe_map::vib_stamp::{Self, VibStamp};
    use sui::clock::{Clock};

    public struct Venue has key, store {
        id: UID,
        name: String,
        category: String,
        latitude: u64, // Multiplied by 1,000,000
        longitude: u64, // Multiplied by 1,000,000
        total_check_ins: u64,
        verified: bool,
        owner: address,
    }

    public struct AdminCap has key, store {
        id: UID,
    }

    public struct VenueRegistered has copy, drop {
        venue_id: ID,
        name: String,
        owner: address,
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(admin_cap, ctx.sender());
    }

    public fun register_venue(
        _admin: &AdminCap,
        name: String,
        category: String,
        latitude: u64,
        longitude: u64,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let venue_id = id.to_inner();
        let owner = ctx.sender();

        let venue = Venue {
            id,
            name,
            category,
            latitude,
            longitude,
            total_check_ins: 0,
            verified: true,
            owner,
        };

        transfer::share_object(venue);

        event::emit(VenueRegistered {
            venue_id,
            name,
            owner,
        });
    }

    public fun check_in(
        venue: &mut Venue,
        image_url: vector<u8>,
        caption: String,
        rating: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ): VibStamp {
        venue.total_check_ins = venue.total_check_ins + 1;
        
        vib_stamp::mint_internal(
            venue.id.to_inner(),
            venue.total_check_ins,
            image_url,
            caption,
            rating,
            clock,
            ctx
        )
    }

    public fun claim_venue(venue: &mut Venue, ctx: &mut TxContext) {
        // Simple claim logic: only if not yet verified or admin transfers it
        // In real app, this would involve merchant verification
        venue.owner = ctx.sender();
    }
}
