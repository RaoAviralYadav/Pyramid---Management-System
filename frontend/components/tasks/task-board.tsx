'use client';

import { useRouter } from 'next/navigation';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvidedDragHandleProps,
  type DraggableProvidedDraggableProps,
  type DropResult,
} from '@hello-pangea/dnd';
import { AvatarStack, LabelPill, PriorityTag } from '@/components/ui/primitives';
import type { Task, TaskStatus } from '@/lib/types';
import { STATUS_LABEL, formatShortDate, isOverdue } from '@/lib/utils';
import type { VisibleFields } from './task-toolbar';

const ORDER: TaskStatus[] = ['BACKLOG', 'TODO', 'DOING', 'ON_HOLD', 'COMPLETED'];

export function TaskBoard({
  tasks,
  visibleFields,
  onMove,
  onAddTask,
}: {
  tasks: Task[];
  visibleFields: VisibleFields;
  onMove: (taskId: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}) {
  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    onMove(draggableId, destination.droppableId as TaskStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            visibleFields={visibleFields}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

function Column({
  status,
  tasks,
  visibleFields,
  onAddTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  visibleFields: VisibleFields;
  onAddTask: (status: TaskStatus) => void;
}) {
  return (
    <div className="flex flex-col w-72 shrink-0 h-full">
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-sm font-medium text-fg flex items-center gap-1.5">
          {STATUS_LABEL[status]}
          <span className="text-fg-muted font-normal">{tasks.length}</span>
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onAddTask(status)}
            className="h-6 w-6 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg"
            aria-label={`Add task to ${STATUS_LABEL[status]}`}
          >
            <PlusIcon />
          </button>
          <button className="h-6 w-6 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg">
            <MoreIcon />
          </button>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[80px] rounded-xl p-1.5 flex flex-col gap-2 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent-soft/40' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <TaskCard
                    task={task}
                    visibleFields={visibleFields}
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    dragging={dragSnapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <button
              onClick={() => onAddTask(status)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-fg-muted hover:bg-hover hover:text-fg transition-colors"
            >
              <PlusIcon /> Add Task
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TaskCard({
  task,
  visibleFields,
  innerRef,
  draggableProps,
  dragHandleProps,
  dragging,
}: {
  task: Task;
  visibleFields: VisibleFields;
  innerRef: (el: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  dragging: boolean;
}) {
  const router = useRouter();
  const overdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED';

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => router.push(`/tasks/${task.id}`)}
      className={`rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-fg-muted/40 transition-shadow ${
        dragging ? 'shadow-popover rotate-1' : ''
      }`}
    >
      <p className="text-sm text-fg leading-snug">{task.title}</p>

      {visibleFields.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.slice(0, 2).map((l) => (
            <LabelPill key={l} label={l} />
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {visibleFields.priority && <PriorityTag priority={task.priority} showLabel={false} />}
          {visibleFields.dueDate && task.dueDate && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${overdue ? 'bg-red-500/10 text-red-500' : 'text-fg-muted'}`}>
              {formatShortDate(task.dueDate)}
            </span>
          )}
        </div>
        {visibleFields.members && <AvatarStack users={task.assignees} max={2} />}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
