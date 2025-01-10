#!/usr/bin/env bash

set -f  # Disable globbing
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"

AGENT_WORKER_REPO="../agent-worker"
SCHEMA_LOCATION="$AGENT_WORKER_REPO/schema.json"
TYPES_OUTPUT="src/lib/types/schema.ts"

# Get git repo information to be stored together with the
# auto generated types
AGENT_WORKER_COMMIT_INFO="$(cd $SCRIPT_DIR/$AGENT_WORKER_REPO; git log -1 --format=" * Branch: %D\n * Commit Hash: %H\n * Date: %cd"
)"

COMMIT_INFO='/**
 * Types generated from repo agent-worker/schema.json
 * based on the following commit:
 *
 * Repo: agent-worker
'$AGENT_WORKER_COMMIT_INFO'
 * */\n'

echo -e "$COMMIT_INFO" > "$SCRIPT_DIR/$TYPES_OUTPUT"

echo "reading from file $SCHEMA_LOCATION"
echo
# It seems like the current schema doesnt export all of the definions. So to make sure that it does
# I add them to an "allOf" statement before converting it into typescript.
cat "$SCRIPT_DIR/$SCHEMA_LOCATION" |
  npx json -e 'this.allOf = Object.keys(this.definitions).map((k) => ({"$ref": "#/definitions/"+k})); this["$ref"] = undefined' |
  npx json2ts >> "$SCRIPT_DIR/$TYPES_OUTPUT"

echo "wrote to file $SCRIPT_DIR/$TYPES_OUTPUT"
echo

echo "commit info:"
echo -e "$AGENT_WORKER_COMMIT_INFO"
