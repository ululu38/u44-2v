CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);

--> statement-breakpoint
INSERT INTO "categories" ("id", "name") VALUES
(1, 'Movement'),
(2, 'Solution'),
(3, 'Product'),
(4, 'Project'),
(5, 'Services'),
(6, 'News'),
(7, 'Solution News')
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";

--> statement-breakpoint
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

