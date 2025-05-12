#!/bin/sh
set -e

# login w/ svc acc
echo "Logging in with service account..."
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS

# get cluster creds
echo "Getting cluster credentials..."
gcloud container clusters get-credentials $GKE_CLUSTER_NAME --region $GKE_REGION --project $GKE_PROJECT_ID

# port forward
echo "Forwarding ports:"
echo "  8081 -> agent worker"
echo "  8082 -> tribuilder"

# run port forwards
kubectl port-forward --address 0.0.0.0 svc/tribuilder 8082:8080 & \
kubectl port-forward --address 0.0.0.0 svc/agent-worker 8081:8080