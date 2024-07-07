FROM ghcr.io/mnofresno/android-build:2.0.0

RUN apk update && apk add --no-cache bash nodejs yarn
RUN yarn global add cordova npm

ENV PATH /usr/local/bin:$PATH
