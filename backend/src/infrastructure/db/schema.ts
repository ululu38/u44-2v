import { pgTable, serial, text, varchar, timestamp, integer, primaryKey, jsonb, boolean, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Custom Drizzle type for PostgreSQL bytea (binary data)
export const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
  toDriver(val: Buffer) {
    return val;
  },
  fromDriver(val: any) {
    if (Buffer.isBuffer(val)) {
      return val;
    }
    // If pg driver returns it as a hex string (e.g. \x0123...), parse it.
    if (typeof val === 'string') {
      const hex = val.startsWith('\\x') ? val.substring(2) : val;
      return Buffer.from(hex, 'hex');
    }
    return val;
  }
});

// 1. Users Table
export const users = pgTable('users', {
  uid: serial('uid').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  role: varchar('role', { length: 20 }).default('employee').notNull(),
  isEmailActive: boolean('is_email_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Media Table (New Gallery Storage)
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  urlFull: varchar('url_full', { length: 500 }).notNull(),
  urlThumb: varchar('url_thumb', { length: 500 }).notNull(),
  urlMini: varchar('url_mini', { length: 500 }).default('/images/fallback-mini.webp').notNull(),
  blurHash: text('blur_hash').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Table to store image binary data
export const mediaBlobs = pgTable('media_blobs', {
  id: integer('id').primaryKey().references(() => media.id, { onDelete: 'cascade' }),
  dataFull: bytea('data_full'),
  dataThumb: bytea('data_thumb'),
  dataMini: bytea('data_mini'),
  dataOriginal: bytea('data_original'),
});



// 2. Posts Table
export const posts = pgTable('posts', {
  postId: serial('post_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  contentHtml: text('content_html').notNull(),
  contentText: text('content_text').notNull(),
  tags: jsonb('tags'),
  status: integer('status').default(1),
  views: integer('views').default(0),

  slug: varchar('slug', { length: 500 }).unique(),
  thumbnailMediaId: integer('thumbnail_media_id').references(() => media.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  thumbnailMedia: one(media, {
    fields: [posts.thumbnailMediaId],
    references: [media.id],
  }),
  sliderImages: many(postImages),
  clients: many(postClients),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  posts: many(posts),
  sliderImages: many(postImages),
  partners: many(partners),
  clients: many(clients),
  banners: many(banners),
}));

export const postImages = pgTable('post_images', {
  postId: integer('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
  mediaId: integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.mediaId] }),
}));

export const postImagesRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.postId],
  }),
  media: one(media, {
    fields: [postImages.mediaId],
    references: [media.id],
  }),
}));



// 4. Partners Table

export const partners = pgTable('partners', {
  partnerId: serial('partner_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logoMediaId: integer('logo_media_id').references(() => media.id, { onDelete: 'set null' }),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const partnersRelations = relations(partners, ({ one }) => ({
  logoMedia: one(media, {
    fields: [partners.logoMediaId],
    references: [media.id],
  }),
}));

// Junction Tables

export const postPartners = pgTable('post_partners', {
  postId: integer('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
  partnerId: integer('partner_id').notNull().references(() => partners.partnerId, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.partnerId] }),
}));


// 6. Tickets Table (Contact Form)
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketId: varchar('ticket_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Hashtags Table
export const hashtags = pgTable('hashtags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});




// 10. Client Groups Table
export const clientGroups = pgTable('client_groups', {
  groupId: serial('group_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  displayOrder: integer('display_order').default(0),
});

// 11. Clients Table
export const clients = pgTable('clients', {
  clientId: serial('client_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logoMediaId: integer('logo_media_id').references(() => media.id, { onDelete: 'set null' }),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 12. Client-Group Junction Table
export const clientGroupRelations = pgTable('client_group_relations', {
  clientId: integer('client_id').notNull().references(() => clients.clientId, { onDelete: 'cascade' }),
  groupId: integer('group_id').notNull().references(() => clientGroups.groupId, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.clientId, t.groupId] }),
}));

// Client-Group Relations
export const clientGroupRelationsRelations = relations(clientGroupRelations, ({ one }) => ({
  client: one(clients, {
    fields: [clientGroupRelations.clientId],
    references: [clients.clientId],
  }),
  group: one(clientGroups, {
    fields: [clientGroupRelations.groupId],
    references: [clientGroups.groupId],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  logoMedia: one(media, {
    fields: [clients.logoMediaId],
    references: [media.id],
  }),
  groups: many(clientGroupRelations),
  posts: many(postClients),
}));

export const clientGroupsRelations = relations(clientGroups, ({ many }) => ({
  clients: many(clientGroupRelations),
}));

// 13. Post-Clients Junction Table for Many-to-Many
export const postClients = pgTable('post_clients', {
  postId: integer('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
  clientId: integer('client_id').notNull().references(() => clients.clientId, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.clientId] }),
}));

export const postClientsRelations = relations(postClients, ({ one }) => ({
  post: one(posts, {
    fields: [postClients.postId],
    references: [posts.postId],
  }),
  client: one(clients, {
    fields: [postClients.clientId],
    references: [clients.clientId],
  }),
}));

// 14. Banners Table
export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' }),
  linkUrl: varchar('link_url', { length: 500 }),
  status: integer('status').default(1).notNull(), // 1 = public, 0 = draft
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bannersRelations = relations(banners, ({ one }) => ({
  media: one(media, {
    fields: [banners.mediaId],
    references: [media.id],
  }),
}));
