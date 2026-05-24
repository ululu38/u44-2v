CREATE TABLE "client_group_relations" (
	"client_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	CONSTRAINT "client_group_relations_client_id_group_id_pk" PRIMARY KEY("client_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "client_groups" (
	"group_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"client_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_media_id" integer,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "client_group_relations" ADD CONSTRAINT "client_group_relations_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_group_relations" ADD CONSTRAINT "client_group_relations_group_id_client_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."client_groups"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_media_id_media_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;