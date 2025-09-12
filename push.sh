#!/bin/bash
PROGRESS_FLAG=""
if [ "$DEPLOY_SCRIPT_RUN" = "true" ]; then
  PROGRESS_FLAG="--progress plain"
fi

docker buildx build . --builder nexus-builder --platform linux/amd64 --tag rg.fr-par.scw.cloud/tf-prod/nexus-frontend:latest --push $PROGRESS_FLAG