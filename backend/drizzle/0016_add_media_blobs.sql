CREATE TABLE IF NOT EXISTS "media_blobs" (
	"id" integer PRIMARY KEY NOT NULL,
	"data_full" bytea,
	"data_thumb" bytea,
	"data_mini" bytea,
	"data_original" bytea
);
--> statement-breakpoint
ALTER TABLE "media_blobs" ADD CONSTRAINT "media_blobs_id_media_id_fk" FOREIGN KEY ("id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
