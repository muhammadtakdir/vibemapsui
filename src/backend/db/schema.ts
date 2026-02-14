import { pgTable, uuid, text, doublePrecision, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  telegramId: text("telegram_id").unique().notNull(),
  walletAddress: text("wallet_address").unique().notNull(),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  totalStamps: integer("total_stamps").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address"),
  photos: text("photos").array(),
  totalCheckIns: integer("total_check_ins").default(0),
  verified: boolean("verified").default(false),
  onChainId: text("on_chain_id"),
});

export const checkIns = pgTable("check_ins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  venueId: uuid("venue_id").references(() => venues.id).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  photoUrl: text("photo_url"),
  caption: text("caption"),
  rating: integer("rating"),
  stampNftId: text("stamp_nft_id"),
  visitorNumber: integer("visitor_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkInId: uuid("check_in_id").references(() => checkIns.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id"),
  replyDepth: integer("reply_depth").default(0),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sponsoredTransactions = pgTable("sponsored_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  transactionDigest: text("transaction_digest"),
  transactionType: text("transaction_type"),
  gasUsed: text("gas_used"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});
