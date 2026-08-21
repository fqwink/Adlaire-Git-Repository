import { validateRepositoryName } from "../domain/repository.ts";
import {
  validateGitRef,
  validateRepositoryPath,
} from "../domain/repository_path.ts";

export interface CommitSummary {
  readonly sha: string;
  readonly author: string;
  readonly authoredAt: string;
  readonly subject: string;
}

export interface TreeEntry {
  readonly mode: string;
  readonly type: "blob" | "tree" | "commit";
  readonly sha: string;
  readonly path: string;
}

export class GitService {
  constructor(private readonly repositoryRoot: string) {}

  repositoryPath(owner: string, name: string): string {
    const safeOwner = validateRepositoryName(owner, "owner");
    const safeName = validateRepositoryName(name, "name");
    return `${this.repositoryRoot}/${safeOwner}/${safeName}.git`;
  }

  async initializeBareRepository(owner: string, name: string): Promise<string> {
    const path = this.repositoryPath(owner, name);
    await Deno.mkdir(path.substring(0, path.lastIndexOf("/")), {
      recursive: true,
    });

    const command = new Deno.Command("git", {
      args: ["init", "--bare", path],
      stdout: "piped",
      stderr: "piped",
    });
    const output = await command.output();

    if (!output.success) {
      const stderr = new TextDecoder().decode(output.stderr);
      throw new Error(stderr.trim() || "git init --bare failed.");
    }

    const headOutput = await new Deno.Command("git", {
      args: ["--git-dir", path, "symbolic-ref", "HEAD", "refs/heads/main"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    if (!headOutput.success) {
      const stderr = new TextDecoder().decode(headOutput.stderr);
      throw new Error(stderr.trim() || "git symbolic-ref HEAD failed.");
    }

    return path;
  }

  async deleteRepository(owner: string, name: string): Promise<void> {
    const path = this.repositoryPath(owner, name);
    try {
      await Deno.remove(path, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  async listBranches(owner: string, name: string): Promise<string[]> {
    const path = this.repositoryPath(owner, name);
    const output = await this.git(path, [
      "for-each-ref",
      "--format=%(refname:short)",
      "refs/heads",
    ]);
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  }

  async listTags(owner: string, name: string): Promise<string[]> {
    const path = this.repositoryPath(owner, name);
    const output = await this.git(path, [
      "for-each-ref",
      "--format=%(refname:short)",
      "refs/tags",
    ]);
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  }

  async readReadme(owner: string, name: string): Promise<string | null> {
    const path = this.repositoryPath(owner, name);
    for (const filename of ["README.md", "README.txt", "README"]) {
      const result = await this.tryGit(path, ["show", `HEAD:${filename}`]);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }

  async listCommits(
    owner: string,
    name: string,
    ref = "HEAD",
    limit = 50,
  ): Promise<CommitSummary[]> {
    const path = this.repositoryPath(owner, name);
    const safeRef = validateGitRef(ref);
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const output = await this.tryGit(path, [
      "log",
      `-${safeLimit}`,
      "--format=%H%x1f%an%x1f%aI%x1f%s",
      safeRef,
    ]);
    if (output === null || output.trim() === "") {
      return [];
    }

    return output.trim().split("\n").map((line) => {
      const [sha, author, authoredAt, subject] = line.split("\u001f");
      return { sha, author, authoredAt, subject };
    });
  }

  async listTree(
    owner: string,
    name: string,
    ref = "HEAD",
    repositoryPath = "",
  ): Promise<TreeEntry[]> {
    const path = this.repositoryPath(owner, name);
    const safeRef = validateGitRef(ref);
    const safePath = validateRepositoryPath(repositoryPath);
    const target = safePath === "" ? safeRef : `${safeRef}:${safePath}`;
    const output = await this.tryGit(path, ["ls-tree", target]);
    if (output === null || output.trim() === "") {
      return [];
    }

    return output.trim().split("\n").map((line) => {
      const [metadata, entryPath] = line.split("\t");
      const [mode, type, sha] = metadata.split(" ");
      return { mode, type: type as TreeEntry["type"], sha, path: entryPath };
    });
  }

  async readFile(
    owner: string,
    name: string,
    repositoryPath: string,
    ref = "HEAD",
  ): Promise<string | null> {
    const path = this.repositoryPath(owner, name);
    const safeRef = validateGitRef(ref);
    const safePath = validateRepositoryPath(repositoryPath);
    if (safePath === "") {
      throw new Error("repository path is required.");
    }
    return await this.tryGit(path, ["show", `${safeRef}:${safePath}`]);
  }

  private async git(repositoryPath: string, args: string[]): Promise<string> {
    const output = await this.run(["--git-dir", repositoryPath, ...args]);
    if (!output.success) {
      throw new Error(output.stderr.trim() || "git command failed.");
    }
    return output.stdout;
  }

  private async tryGit(
    repositoryPath: string,
    args: string[],
  ): Promise<string | null> {
    const output = await this.run(["--git-dir", repositoryPath, ...args]);
    return output.success ? output.stdout : null;
  }

  private async run(
    args: string[],
  ): Promise<
    { readonly success: true; readonly stdout: string } | {
      readonly success: false;
      readonly stdout: string;
      readonly stderr: string;
    }
  > {
    const command = new Deno.Command("git", {
      args,
      stdout: "piped",
      stderr: "piped",
    });
    const output = await command.output();
    const stdout = new TextDecoder().decode(output.stdout);
    const stderr = new TextDecoder().decode(output.stderr);

    if (!output.success) {
      return { success: false, stdout, stderr };
    }

    return { success: true, stdout };
  }
}
