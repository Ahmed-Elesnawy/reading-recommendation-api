import { PrismaService } from '../../prisma/prisma.service';

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findOne(where: Partial<T>): Promise<T | null>;
  findMany(params: {
    where?: Partial<T>;
    skip?: number;
    take?: number;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<T[]>;
  update(where: Partial<T>, data: Partial<T>): Promise<T>;
  delete(where: Partial<T>): Promise<T>;
  count(where?: Partial<T>): Promise<number>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: keyof Omit<
      PrismaService,
      | '$on'
      | '$connect'
      | '$disconnect'
      | '$use'
      | '$transaction'
      | '$queryRaw'
      | '$executeRaw'
    >,
  ) {}

  protected get model() {
    return this.prisma[this.modelName];
  }

  async create(data: Partial<T>): Promise<T> {
    return (this.model as any).create({
      data,
    });
  }

  async findOne(where: Partial<T>): Promise<T | null> {
    return (this.model as any).findFirst({
      where,
    });
  }

  async findMany(params: {
    where?: Partial<T>;
    skip?: number;
    take?: number;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<T[]> {
    const { where, skip, take, orderBy } = params;
    return (this.model as any).findMany({
      where,
      skip,
      take,
      orderBy,
    });
  }

  async update(where: Partial<T>, data: Partial<T>): Promise<T> {
    return (this.model as any).update({
      where,
      data,
    });
  }

  async delete(where: Partial<T>): Promise<T> {
    return (this.model as any).delete({
      where,
    });
  }

  async count(where?: Partial<T>): Promise<number> {
    return (this.model as any).count({
      where,
    });
  }
} 