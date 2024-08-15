FROM ghcr.io/mnofresno/android-build:2.0.0

RUN apk update && apk add --no-cache bash=5.2.15-r5 nodejs=18.20.1-r0 yarn=1.22.19-r0
RUN yarn global add npm@10.8.1
RUN yarn global add cordova@12.0.0
RUN yarn config set "strict-ssl" true
RUN yarn config set "preferred-hosts" "github.com:https"

ENV PATH /app:/usr/local/bin:$PATH

RUN apk add openssh
