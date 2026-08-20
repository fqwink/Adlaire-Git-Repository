FROM denoland/deno:alpine

RUN apk add --no-cache git git-daemon sqlite

WORKDIR /app
COPY . .

ENV ADLAIRE_HOST=0.0.0.0
EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "--allow-run", "src/main.ts"]
