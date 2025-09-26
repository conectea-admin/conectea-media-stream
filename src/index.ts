import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import z from "zod";

import { passthroughHeaders } from "@/lib/constants";
import { env } from "@/lib/env";
import { getGoogleAccessToken } from "@/lib/google";

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
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
    }),
  )
  .use(
    cors({
      methods: [
        "GET",
        "HEAD",
        "OPTIONS",
      ],
      origin: env.CORS_ORIGINS,
      allowedHeaders: [
        "Range",
      ],
    }),
  )
  .get(
    "/api/media/stream/:id",
    async ({ params, headers, status }) => {
      const { id } = params;
      const range = headers.range;
      const accessToken = await getGoogleAccessToken();

      const url = new URL(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`,
      );
      url.searchParams.set("alt", "media");
      url.searchParams.set("supportsAllDrives", "true");

      const reqHeaders = new Headers();

      reqHeaders.set("Authorization", `Bearer ${accessToken}`);
      if (range) {
        reqHeaders.set("Range", range);
      }

      const upstream = await fetch(url, {
        headers: reqHeaders,
        redirect: "follow"
      });

      if (!upstream.ok) {
        return status( 500, "Failed to fetch media");
      }

      const responseHeaders = new Headers();
      for (const key of passthroughHeaders) {
        const v = upstream.headers.get(key);
        if (v) responseHeaders.set(key, v);
      }

      const res = new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders
      });

      let mappedStatus: 200 | 206 | 500;
      if (upstream.status === 200) {
        mappedStatus = 200;
      } else if (upstream.status === 206) {
        mappedStatus = 206;
      } else {
        mappedStatus = 500;
      }

      return status(mappedStatus, res);

    },
    {
      response: {
        200: z.unknown(),
        206: z.unknown(),
        500: z.literal("Failed to fetch media"),
      },
      params: z.object({
        id: z.string(),
      }),
      headers: z.object({
        range: z.string().optional(),
      }),
      detail: {
        summary: "Fetch media",
        description:
          "Fetch media from Conectea's Google Drive (Audio, PDF and Video files)",
      },
    },
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
