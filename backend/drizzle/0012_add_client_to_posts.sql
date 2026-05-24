ALTER TABLE "posts" ADD COLUMN "client_id" integer;
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE set null ON UPDATE no action;
