import { dns } from "bun";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import wol from "wake_on_lan";

const app = new Hono();

app.get("/computer/:pc", async (c) => {
  if (c === undefined) throw new HTTPException(500);

  const authHeader = c.req.header("Authorization");

  const password = await Bun.file("/run/secrets/authKey").text();

  if (password !== authHeader) {
    return c.text("Not Authorized", 401);
  }

  const pcMac = process.env[`${c.req.param("pc")}_MAC`];

  const pcAddress = process.env[`${c.req.param("pc")}_ADDRESS`];

  if (pcMac === undefined || pcAddress === undefined) {
    throw new HTTPException(400);
  }

  const x = await dns.lookup(pcAddress)
  const address = x[0]?.address

  wol.wake(pcMac, { address });

  return c.text(`Computer ${c.req.param("pc")} with ip ${address} has been turned on`);
});

app.get("*", (c) => {
  return c.text("Not found", 404);
});

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 3001,
});
