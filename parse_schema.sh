#!/usr/bin/env sh

set -f  # Disable globbing
SCRIPT_DIR="$(dirname "$0")"

AGENT_WORKER_REPO="${AGENT_WORKER_DIR:-../agent-worker}"
SCHEMA_LOCATION="$AGENT_WORKER_REPO/schema/execution.json"
TYPES_OUTPUT="src/lib/types/agent.ts"

# Get git repo information to be stored together with the
# auto generated types
AGENT_WORKER_COMMIT_INFO="$(
  cd $SCRIPT_DIR/$AGENT_WORKER_REPO;
  git log -1 --format=" * Branch: %D\n * Commit Hash: %H\n * Date: %cd"
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

cat "$SCRIPT_DIR/$SCHEMA_LOCATION" |
  # exports the meta type as well
  # bunx json -e 'var dk=this.definitions?"definitions":"$defs"; this.allOf=Object.keys(this[dk]).map(k=>({"$ref":"#/"+dk+"/"+k})); this["$ref"]=undefined' |
  # add --unreachableDefinitions if needed
  bunx json2ts >> "$SCRIPT_DIR/$TYPES_OUTPUT"

# Inject the UUID type after the last comment block (*/)
sed -i '/\/\*/ a\import type { UUID as Uuid } from "crypto" \
export type { Uuid } \
' "$SCRIPT_DIR/$TYPES_OUTPUT"
# Remove the old export type Uuid line
sed -i '/export type Uuid/d' "$SCRIPT_DIR/$TYPES_OUTPUT"

bun run prettier --write "$SCRIPT_DIR/$TYPES_OUTPUT"

echo "wrote to file $SCRIPT_DIR/$TYPES_OUTPUT"
echo

echo "commit info:"
echo -e "$AGENT_WORKER_COMMIT_INFO"
