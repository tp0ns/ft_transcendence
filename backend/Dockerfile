FROM node as dev

WORKDIR /backend/
COPY ./launch_script.sh .

CMD [ "bash", "launch_script.sh" ] 

FROM	node:alpine as build

COPY	. /backend/
WORKDIR /backend/

RUN npm install
RUN npm run build


FROM	node:alpine as production

COPY	. /backend/
COPY	--from=build /backend/dist /backend/dist
WORKDIR /backend/
RUN		npm ci --omit=dev

CMD		["npm", "run", "start:prod"]