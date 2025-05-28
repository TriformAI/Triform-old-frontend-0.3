ALTER TABLE "node_positions" RENAME COLUMN "flow_component_id" TO "parent_id";--> statement-breakpoint
ALTER TABLE "node_positions" DROP CONSTRAINT "node_positions_flow_component_id_node_id_pk";--> statement-breakpoint
ALTER TABLE "node_positions" ADD CONSTRAINT "node_positions_parent_id_node_id_pk" PRIMARY KEY("parent_id","node_id");