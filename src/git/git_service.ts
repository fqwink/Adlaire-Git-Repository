import { validateRepositoryName } from "../domain/repository.ts";

export class GitService {
  constructor(private readonly repositoryRoot: string) {}

  repositoryPath(owner: string, name: string): string {
    const safeOwner = validateRepositoryName(owner, "owner");
    const safeName = validateRepositoryName(name, "name");
    return `${this.repositoryRoot}/${safeOwner}/${safeName}.git`;
  }

  async initializeBareRepository(owner: string, name: string): Promise<string> {
    const path = this.repositoryPath(owner, name);
    await Deno.mkdir(path.substring(0, path.lastIndexOf("/")), { recursive: true });

    const command = new Deno.Command("git", {
      args: ["init", "--bare", path],
      stdout: "piped",
      stderr: "piped"
    });
    const output = await command.output();

    if (!output.success) {
      const stderr = new TextDecoder().decode(output.stderr);
      throw new Error(stderr.trim() || "git init --bare failed.");
    }

    return path;
  }
}
