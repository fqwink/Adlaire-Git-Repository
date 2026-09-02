import { LibsqlDriver } from "../../src/database/libsql_driver.ts";
import { assert, assertEquals, assertRejects } from "../support/assert.ts";

Deno.test("LibsqlDriver sends Hrana pipeline requests without npm dependencies", async () => {
  const requests: unknown[] = [];
  const server = Deno.serve(
    { hostname: "127.0.0.1", port: 0 },
    async (request) => {
      assertEquals(new URL(request.url).pathname, "/v2/pipeline");
      assertEquals(request.headers.get("authorization"), "Bearer secret");
      const body = await request.json();
      requests.push(body);
      return Response.json({
        results: [
          {
            type: "ok",
            response: {
              type: "execute",
              result: {
                cols: [{ name: "id" }, { name: "name" }, { name: "active" }],
                rows: [[
                  { type: "text", value: "1" },
                  { type: "text", value: "platform" },
                  { type: "integer", value: 1 },
                ]],
              },
            },
          },
        ],
      });
    },
  );

  try {
    const driver = new LibsqlDriver(
      `http://127.0.0.1:${server.addr.port}`,
      "secret",
    );
    const rows = await driver.query<{
      id: string;
      name: string;
      active: number;
    }>("SELECT id, name, active FROM users;");

    assertEquals(rows.length, 1);
    assertEquals(rows[0].id, "1");
    assertEquals(rows[0].name, "platform");
    assertEquals(rows[0].active, 1);
    assertEquals(requests.length, 1);
    assert(
      JSON.stringify(requests[0]).includes(
        "SELECT id, name, active FROM users",
      ),
      "Hrana request must contain the SQL statement.",
    );
  } finally {
    await server.shutdown();
  }
});

Deno.test("LibsqlDriver rejects direct file database URLs", () => {
  assertRejects(
    () => {
      new LibsqlDriver("file:/tmp/adlaire.libsql");
    },
    "DB_URL for libsql must be http://, https://, or libsql://",
  );
});
