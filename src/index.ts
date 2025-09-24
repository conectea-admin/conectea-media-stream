import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { env } from "./lib/env";

const port = env.PORT || 3000;
const styles = await Bun.file("./src/scalar.css").text();

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "Conectea Media Stream",
          version: "1.0.0",
          description:
            "ConecTEA Media Stream API used to stream media from the ConecTEA platform",
        },
      },
      scalar: {
        customCss: styles,
      },
    }),
  )
  .get("/health", ({ status }) => status(200), {
    detail: {
      hide: true,
    },
  })
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
