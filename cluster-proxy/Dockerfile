FROM google/cloud-sdk:alpine

# install kubectl
RUN gcloud components install kubectl

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
