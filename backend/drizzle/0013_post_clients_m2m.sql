CREATE TABLE IF NOT EXISTS "post_clients" (
	"post_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	CONSTRAINT "post_clients_post_id_client_id_pk" PRIMARY KEY("post_id","client_id")
);
--> statement-breakpoint
ALTER TABLE "post_clients" ADD CONSTRAINT "post_clients_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post_clients" ADD CONSTRAINT "post_clients_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Migrate existing data
INSERT INTO "post_clients" ("post_id", "client_id")
SELECT "post_id", "client_id" FROM "posts" WHERE "client_id" IS NOT NULL ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Drop column from posts
ALTER TABLE "posts" DROP COLUMN IF EXISTS "client_id";
