import {
  createRepositoryId,
  type RepositoryInput,
  type RepositoryRecord,
  validateRepositoryName
} from "../domain/repository.ts";

export interface RepositoryStore {
  create(record: RepositoryRecord): Promise<RepositoryRecord>;
  list(): Promise<RepositoryRecord[]>;
}

export interface GitStorage {
  initializeBareRepository(owner: string, name: string): Promise<string>;
}

export class RepositoryService {
  constructor(
    private readonly repositoryRepository: RepositoryStore,
    private readonly git: GitStorage
  ) {}

  async createRepository(input: RepositoryInput): Promise<RepositoryRecord> {
    const owner = validateRepositoryName(input.owner, "owner");
    const name = validateRepositoryName(input.name, "name");
    const now = new Date().toISOString();
    const barePath = await this.git.initializeBareRepository(owner, name);

    return await this.repositoryRepository.create({
      id: createRepositoryId(owner, name),
      owner,
      name,
      visibility: input.visibility,
      barePath,
      createdAt: now,
      updatedAt: now
    });
  }

  listRepositories(): Promise<RepositoryRecord[]> {
    return this.repositoryRepository.list();
  }
}
