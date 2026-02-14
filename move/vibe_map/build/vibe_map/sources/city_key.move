module vibe_map::city_key {
    use std::string::{String};
    use sui::event;
    use vibe_map::vib_stamp::{Self, VibStamp};

    public struct CityKey has key, store {
        id: UID,
        city_name: String,
        tier: u8,
        power: u64,
    }

    public struct StampsFused has copy, drop {
        user: address,
        key_id: ID,
        city_name: String,
    }

    /// Fuse multiple stamps to create a City Key
    /// For MVP, we take 3 stamps and produce 1 Key
    public fun fuse_stamps(
        s1: VibStamp,
        s2: VibStamp,
        s3: VibStamp,
        city_name: String,
        ctx: &mut TxContext
    ): CityKey {
        // Burn the stamps
        vib_stamp::burn(s1);
        vib_stamp::burn(s2);
        vib_stamp::burn(s3);

        let id = object::new(ctx);
        let key_id = id.to_inner();
        let user = ctx.sender();

        event::emit(StampsFused {
            user,
            key_id,
            city_name: *&city_name,
        });

        CityKey {
            id,
            city_name,
            tier: 1,
            power: 100,
        }
    }
}
