FROM oven/bun

COPY package.json .
COPY bun.lock .
COPY index.ts .

RUN bun install

CMD [ "bun", "start" ]
