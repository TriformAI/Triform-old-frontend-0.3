CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_organizations" (
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	CONSTRAINT "user_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;