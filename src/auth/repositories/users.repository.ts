import { User } from "@prisma/client";
import { BaseRepository } from "src/common/repositories/base.repository";
import { PrismaService } from "src/prisma/prisma.service";

export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }
}
