module vibe_map::collection {
    use std::string::{String};
    use sui::event;

    public struct Achievement has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
    }

    public struct UserStats has key, store {
        id: UID,
        total_stamps: u64,
        distinct_venues: u64,
        achievements_count: u64,
    }

    public struct AchievementUnlocked has copy, drop {
        user: address,
        achievement_id: ID,
        name: String,
    }

    public fun init_user_stats(ctx: &mut TxContext): UserStats {
        UserStats {
            id: object::new(ctx),
            total_stamps: 0,
            distinct_venues: 0,
            achievements_count: 0,
        }
    }

    // In a real app, this would be called by a trusted backend or through a more complex capability system
    // For MVP, we'll keep it simple
    public fun unlock_achievement(
        _stats: &mut UserStats,
        name: String,
        description: String,
        image_url: String,
        ctx: &mut TxContext
    ): Achievement {
        let id = object::new(ctx);
        let achievement_id = id.to_inner();
        
        event::emit(AchievementUnlocked {
            user: ctx.sender(),
            achievement_id,
            name: *&name,
        });

        Achievement {
            id,
            name,
            description,
            image_url,
        }
    }
}
