FROM ghcr.io/mnofresno/android-build:2.0.0

RUN apk update && apk add --no-cache bash=5.2.15-r5 nodejs=18.20.1-r0 yarn=1.22.19-r0
RUN yarn global add npm@10.8.1
RUN yarn global add cordova@12.0.0

ENV PATH /app:/usr/local/bin:$PATH
