# syntax=docker/dockerfile:1
FROM --platform=linux/amd64 node:20-alpine AS build
ARG GIT_SHA=unknown
ARG IMAGE_REF=local
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN VITE_GIT_SHA=${GIT_SHA} VITE_IMAGE_REF=${IMAGE_REF} npx vite build

FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g serve@14.2.4
COPY --from=build /app/dist ./dist
ENV PORT=10000
EXPOSE 10000
CMD ["sh", "-c", "exec serve -s dist -l \"tcp://0.0.0.0:${PORT}\""]
