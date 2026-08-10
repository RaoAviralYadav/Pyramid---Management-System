'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TaskDetail } from '@/components/tasks/task-detail';

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', params.taskId],
    queryFn: () => api.tasks.get(params.taskId),
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-fg-muted">Loading task…</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-fg-muted">Task not found.</p>
      </div>
    );
  }

  return <TaskDetail task={task} />;
}
