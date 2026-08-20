import type { Principal } from "../domain/user.ts";

export class GitHttpBackend {
  constructor(private readonly repositoryRoot: string) {}

  async handle(input: {
    readonly request: Request;
    readonly owner: string;
    readonly name: string;
    readonly gitPath: string;
    readonly actor: Principal | null;
  }): Promise<Response> {
    const url = new URL(input.request.url);
    const pathInfo = `/${input.owner}/${input.name}.git${input.gitPath}`;
    const body = input.request.body === null ? undefined : input.request.body;
    const command = new Deno.Command("git", {
      args: ["http-backend"],
      stdin: body === undefined ? "null" : "piped",
      stdout: "piped",
      stderr: "piped",
      env: {
        GIT_PROJECT_ROOT: this.repositoryRoot,
        GIT_HTTP_EXPORT_ALL: "1",
        PATH_INFO: pathInfo,
        REQUEST_METHOD: input.request.method,
        QUERY_STRING: url.search.startsWith("?") ? url.search.slice(1) : url.search,
        CONTENT_TYPE: input.request.headers.get("content-type") ?? "",
        REMOTE_USER: input.actor?.username ?? ""
      }
    });

    const process = command.spawn();
    if (body !== undefined && process.stdin !== null) {
      await body.pipeTo(process.stdin);
    }

    const output = await process.output();
    const stderr = new TextDecoder().decode(output.stderr);

    if (!output.success) {
      return new Response(stderr.trim() || "git http-backend failed.", { status: 500 });
    }

    return toResponse(output.stdout);
  }
}

export function isGitWriteRequest(request: Request, gitPath: string): boolean {
  const url = new URL(request.url);
  return gitPath.includes("git-receive-pack") || url.searchParams.get("service") === "git-receive-pack";
}

function toResponse(cgiOutput: Uint8Array): Response {
  const separator = findHeaderSeparator(cgiOutput);
  const normalizedSeparator = separator.index;
  if (normalizedSeparator < 0) {
    return new Response(cgiOutput, { status: 200 });
  }

  const headerText = new TextDecoder().decode(cgiOutput.slice(0, normalizedSeparator));
  const bodyOffset = normalizedSeparator + separator.length;
  const body = cgiOutput.slice(bodyOffset);
  const headers = new Headers();
  let status = 200;

  for (const line of headerText.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index < 0) {
      continue;
    }
    const name = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (name.toLowerCase() === "status") {
      status = Number(value.split(" ", 1)[0]);
    } else {
      headers.append(name, value);
    }
  }

  return new Response(body, { status, headers });
}

function findHeaderSeparator(output: Uint8Array): { readonly index: number; readonly length: number } {
  for (let index = 0; index < output.length - 3; index++) {
    if (output[index] === 13 && output[index + 1] === 10 && output[index + 2] === 13 && output[index + 3] === 10) {
      return { index, length: 4 };
    }
  }

  for (let index = 0; index < output.length - 1; index++) {
    if (output[index] === 10 && output[index + 1] === 10) {
      return { index, length: 2 };
    }
  }

  return { index: -1, length: 0 };
}
