/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'node_positions'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "node_positions" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "node_positions" ALTER COLUMN "flow_component_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "node_positions" ADD CONSTRAINT "node_positions_flow_component_id_node_id_pk" PRIMARY KEY("flow_component_id","node_id");