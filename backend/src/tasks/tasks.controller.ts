import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto, QueryTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { CreateCommentDto } from './dto/comment.dto';
import type { User } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private service: TasksService) {}

  @Get('tasks')
  findAll(@Query() query: QueryTaskDto) {
    return this.service.findAll(query);
  }

  @Get('tasks/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('tasks')
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id);
  }

  @Patch('tasks/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: User) {
    return this.service.update(id, dto, user.id);
  }

  @Delete('tasks/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('tasks/:id/subtasks')
  addSubtask(@Param('id') id: string, @Body() dto: CreateSubtaskDto) {
    return this.service.addSubtask(id, dto);
  }

  @Patch('subtasks/:id')
  updateSubtask(@Param('id') id: string, @Body() dto: UpdateSubtaskDto) {
    return this.service.updateSubtask(id, dto);
  }

  @Delete('subtasks/:id')
  removeSubtask(@Param('id') id: string) {
    return this.service.removeSubtask(id);
  }

  @Post('tasks/:id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.service.addComment(id, dto, user.id);
  }
}
