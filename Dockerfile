FROM denoland/deno:alpine

RUN apk add --no-cache git git-daemon sqlite \
  && mkdir -p /app /data /deno-dir \
  && chown -R deno:deno /app /data /deno-dir

WORKDIR /app
COPY --chown=deno:deno . .

ENV DENO_DIR=/deno-dir
ENV ADLAIRE_HOST=0.0.0.0
ENV ADLAIRE_PORT=8080
ENV ADLAIRE_DATA_DIR=/data
ENV DB_DRIVER=sqlite

USER deno

RUN deno cache src/main.ts

VOLUME ["/data"]
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -T 2 -O - http://127.0.0.1:8080/health >/dev/null || exit 1

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "--allow-run", "src/main.ts"]
