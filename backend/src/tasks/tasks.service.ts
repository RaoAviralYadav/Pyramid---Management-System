import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from './dto/task.dto';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { CreateCommentDto } from './dto/comment.dto';

const taskDetailInclude = Prisma.validator<Prisma.TaskInclude>()({
  assignees: true,
  reporter: true,
  project: true,
  subtasks: { include: { assignee: true }, orderBy: { createdAt: 'asc' } },
  comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
  activities: { include: { user: true }, orderBy: { createdAt: 'desc' } },
});

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(query: QueryTaskDto) {
    return this.prisma.task.findMany({
      where: {
        projectId: query.projectId,
        status: query.status,
        title: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      include: {
        assignees: true,
        reporter: true,
        project: true,
        _count: { select: { subtasks: true, comments: true } },
      },
      // No persisted board-column ordering (see schema.prisma note) — this
      // keeps cards in a stable, predictable order within each status.
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: taskDetailInclude });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(dto: CreateTaskDto, userId: string) {
    const { assigneeIds, dueDate, startDate, ...rest } = dto;
    return this.prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        reporterId: userId,
        assignees: assigneeIds ? { connect: assigneeIds.map((id) => ({ id })) } : undefined,
      },
      include: taskDetailInclude,
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const existing = await this.findOne(id);

    const { assigneeIds, dueDate, startDate, ...rest } = dto;
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        assignees: assigneeIds ? { set: assigneeIds.map((aid) => ({ id: aid })) } : undefined,
      },
      include: taskDetailInclude,
    });

    // Lightweight, best-effort activity log — mirrors the "Updates" feed
    // shown on the task detail screen.
    if (dto.status && dto.status !== existing.status) {
      await this.logActivity(id, userId, `moved this task to ${this.humanize(dto.status)}`);
    }
    if (dto.priority && dto.priority !== existing.priority) {
      await this.logActivity(
        id,
        userId,
        `changed priority from ${this.humanize(existing.priority)} to ${this.humanize(dto.priority)}`,
      );
    }

    return task;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }

  addSubtask(taskId: string, dto: CreateSubtaskDto) {
    const { dueDate, ...rest } = dto;
    return this.prisma.subtask.create({
      data: { ...rest, taskId, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { assignee: true },
    });
  }

  updateSubtask(id: string, dto: UpdateSubtaskDto) {
    const { dueDate, ...rest } = dto;
    return this.prisma.subtask.update({
      where: { id },
      data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { assignee: true },
    });
  }

  removeSubtask(id: string) {
    return this.prisma.subtask.delete({ where: { id } });
  }

  async addComment(taskId: string, dto: CreateCommentDto, userId: string) {
    const comment = await this.prisma.comment.create({
      data: { taskId, authorId: userId, content: dto.content },
      include: { author: true },
    });
    await this.logActivity(taskId, userId, 'posted an update');
    return comment;
  }

  private logActivity(taskId: string, userId: string, message: string) {
    return this.prisma.taskActivity.create({ data: { taskId, userId, message } });
  }

  private humanize(value: string) {
    return value.replace(/_/g, ' ').toLowerCase().replace('no priority', 'No priority');
  }
}
