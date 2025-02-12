PKG_NAME ?= $(shell basename ${PWD})
REGISTRY ?= europe-docker.pkg.dev
PROJECT_ID ?= triformcloud
REPOSITORY ?= k8s
GKE_REGION ?= europe-west3
IMAGE = $(REGISTRY)/$(PROJECT_ID)/$(REPOSITORY)/$(PKG_NAME)
GIT_TAG ?= $(shell git describe --tags --always)
GIT_SHORT_SHA ?= $(shell git rev-parse --short HEAD)
VERSION ?= $(GIT_TAG)-$(GIT_SHORT_SHA)

.PHONY: image
image:
	@docker build \
		--load \
		-t $(IMAGE):$(VERSION) .

.PHONY: image-amd64
image-amd64:
	@docker buildx build \
		--platform linux/amd64 \
		--load \
		-t $(IMAGE):$(VERSION) .

.PHONY: push
push: image-amd64
	@docker push $(IMAGE):$(VERSION)

.PHONY: deploy
deploy:
	@if [ -z "$(GKE_CLUSTER)" ]; then \
		echo "ERROR: GKE_CLUSTER is required. Use 'make deploy GKE_CLUSTER=<cluster>'"; \
		exit 1; \
	fi
	@helm upgrade --install $(PKG_NAME) \
		--values k8s/$(GKE_CLUSTER)/values.yaml \
		--set image.tag=$(VERSION) \
		--kube-context gke_$(PROJECT_ID)_$(GKE_REGION)_$(GKE_CLUSTER) \
		--wait \
		k8s/chart
