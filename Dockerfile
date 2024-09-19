FROM circleci/node:8.16.1@sha256:abb3e8244093b75e077f214d32c747ea9d6c39e856d7c00a37abcf191db40761 as builder

WORKDIR /usr/src/app

COPY / /usr/src/app/

RUN sudo chmod -R 777 /usr/src/app
RUN yarn install
RUN yarn build

FROM nginx:1.16.1@sha256:d20aa6d1cae56fd17cd458f4807e0de462caf2336f0b70b5eeb69fcaaf30dd9c
LABEL maintainer="https://teamdigitale.governo.it"

# Install major CA certificates to cover
# https://github.com/SparebankenVest/azure-key-vault-to-kubernetes integration
RUN apt-get update && \
    apt-get install -y ca-certificates

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/developer-portal.conf
COPY env.sh /usr/share/nginx/html
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

RUN chmod +x /usr/share/nginx/html/env.sh

WORKDIR /usr/share/nginx/html

CMD ./env.sh && rm -rf env.sh && nginx -g 'daemon off;';
