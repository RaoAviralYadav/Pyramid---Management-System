import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      include: { lead: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { lead: true, _count: { select: { tasks: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
      include: { lead: true, _count: { select: { tasks: true } } },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.findOne(id);
    const nextDueDate = dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : existing.dueDate;

    if (nextDueDate) {
      const tasksBeyond = await this.prisma.task.findMany({
        where: {
          projectId: id,
          dueDate: { not: null },
        },
        select: { dueDate: true },
      });

      const tooLate = tasksBeyond.find((task) => task.dueDate && new Date(task.dueDate) > nextDueDate);
      if (tooLate) {
        throw new BadRequestException(`Project due date cannot be earlier than a task due date (${new Date(tooLate.dueDate!).toISOString().slice(0, 10)}).`);
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: { ...dto, dueDate: nextDueDate ?? undefined },
      include: { lead: true, _count: { select: { tasks: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }
}
