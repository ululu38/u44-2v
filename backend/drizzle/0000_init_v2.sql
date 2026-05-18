CREATE TABLE "categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_full" varchar(255) NOT NULL,
	"url_medium" varchar(255) NOT NULL,
	"path_full" varchar(255) NOT NULL,
	"path_medium" varchar(255) NOT NULL,
	"placeholder" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_full" varchar(500) NOT NULL,
	"url_thumb" varchar(500) NOT NULL,
	"blur_hash" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"file_size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_group_relations" (
	"partner_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	CONSTRAINT "partner_group_relations_partner_id_group_id_pk" PRIMARY KEY("partner_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "partner_groups" (
	"group_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"partner_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" varchar(255) NOT NULL,
	"website_url" varchar(255),
	"description" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"post_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "post_categories_post_id_category_id_pk" PRIMARY KEY("post_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "post_partners" (
	"post_id" integer NOT NULL,
	"partner_id" integer NOT NULL,
	CONSTRAINT "post_partners_post_id_partner_id_pk" PRIMARY KEY("post_id","partner_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"post_id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) DEFAULT 'article',
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"thumbnail_url" varchar(255),
	"tags" jsonb,
	"status" varchar(50) DEFAULT 'published',
	"views" integer DEFAULT 0,
	"slug" varchar(500),
	"media_id" integer,
	"image_alt" varchar(255),
	"excerpt" varchar(300),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(50) NOT NULL,
	"firstname" varchar(100) NOT NULL,
	"lastname" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(100) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"resume_path" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tickets_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uid" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(100) NOT NULL,
	"role" varchar(20) DEFAULT 'employee' NOT NULL,
	"is_email_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "partner_group_relations" ADD CONSTRAINT "partner_group_relations_partner_id_partners_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("partner_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_group_relations" ADD CONSTRAINT "partner_group_relations_group_id_partner_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."partner_groups"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_partners" ADD CONSTRAINT "post_partners_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_partners" ADD CONSTRAINT "post_partners_partner_id_partners_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("partner_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;