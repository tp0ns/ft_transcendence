# DEV IMAGE

FROM node:alpine as dev

WORKDIR /frontend/
COPY ./launch_script.sh .

CMD [ "ash", "launch_script.sh" ] 

# BUILDER IMAGE compile front

FROM	node:alpine as build

COPY	. /frontend
WORKDIR	/frontend

RUN		npm ci --omit=dev
RUN 	npm run build

# PRODUCTION IMAGE uses "builder" image compiled files

FROM	caddy:alpine as production

COPY	--from=build /frontend/build /site