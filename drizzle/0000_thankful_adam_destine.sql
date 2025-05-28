CREATE TABLE "drafts" (
	"component_id" uuid PRIMARY KEY NOT NULL,
	"spec" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "node_positions" (
	"flow_component_id" uuid PRIMARY KEY NOT NULL,
	"node_id" uuid NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL
);
