#the tag latest ist not available for the cypress/included image
FROM cypress/included:13.9.0

ENV NO_COLOR=1

RUN mkdir /cypress_Tests

WORKDIR /cypress_Tests

COPY ./cypress ./cypress
COPY ./cypress.config.ts ./cypress.config.ts
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock

RUN yarn install
 
ENTRYPOINT ["yarn", "run", "cypress", "run"]