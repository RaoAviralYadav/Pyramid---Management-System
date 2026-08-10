import { PrismaClient, Priority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dexter = await prisma.user.upsert({
    where: { username: 'dexter' },
    update: {},
    create: {
      email: 'dexter@gmail.com',
      fullName: 'Dexter',
      title: 'Designer',
      username: 'dexter',
      isGuest: false,
      theme: 'LIGHT',
      accentColor: 'BLUE',
    },
  });

  const ankit = await prisma.user.upsert({
    where: { username: 'ankit' },
    update: {},
    create: { fullName: 'Ankit Dutta', username: 'ankit', isGuest: false },
  });

  const homepage = await prisma.project.create({
    data: { name: 'Design Homepage', priority: Priority.HIGH, leadId: dexter.id, dueDate: new Date('2026-09-12') },
  });
  const login = await prisma.project.create({
    data: { name: 'Develop Login Feature', priority: Priority.LOW, dueDate: new Date('2026-09-15') },
  });
  const payment = await prisma.project.create({
    data: { name: 'Test Payment Gateway', priority: Priority.MEDIUM, dueDate: new Date('2026-09-18') },
  });

  const apiDocs = await prisma.task.create({
    data: {
      title: 'Write API Documentation',
      description:
        'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
      status: TaskStatus.BACKLOG,
      priority: Priority.HIGH,
      taskType: 'Designer',
      labels: ['Research', 'Design', 'Development', 'Testing', 'Deployment'],
      startDate: new Date('2026-01-10'),
      dueDate: new Date('2026-07-31'),
      projectId: homepage.id,
      reporterId: dexter.id,
      assignees: { connect: [{ id: dexter.id }] },
    },
  });

  await prisma.subtask.createMany({
    data: [
      { taskId: apiDocs.id, title: 'Subtask 1', priority: Priority.HIGH, dueDate: new Date('2026-09-12'), assigneeId: dexter.id },
      { taskId: apiDocs.id, title: 'Subtask 2', priority: Priority.LOW, dueDate: new Date('2026-09-15') },
      { taskId: apiDocs.id, title: 'Subtask 3', priority: Priority.MEDIUM, dueDate: new Date('2026-09-18') },
    ],
  });

  await prisma.comment.create({
    data: {
      taskId: apiDocs.id,
      authorId: ankit.id,
      content:
        'Left a first pass of comments on the auth endpoints — looks good overall, just flagged a couple of response examples that need updating.',
    },
  });

  await prisma.taskActivity.createMany({
    data: [
      { taskId: apiDocs.id, userId: dexter.id, message: 'changed priority from No priority to High' },
      { taskId: apiDocs.id, userId: ankit.id, message: 'posted an update' },
    ],
  });

  const moreTasks: {
    title: string;
    status: TaskStatus;
    priority?: Priority;
    dueDate: string;
    projectId: string;
    labels?: string[];
  }[] = [
    { title: 'Implement Search Function', status: TaskStatus.TODO, dueDate: '2026-07-29', projectId: homepage.id },
    { title: 'Deploy to Production', status: TaskStatus.TODO, dueDate: '2026-07-29', projectId: payment.id },
    { title: 'Code Review Completed', status: TaskStatus.DOING, dueDate: '2026-07-29', projectId: login.id },
    { title: 'Design Mockups Finalized', status: TaskStatus.DOING, dueDate: '2026-07-29', projectId: homepage.id },
    { title: 'Feature Testing Passed', status: TaskStatus.COMPLETED, dueDate: '2026-07-30', projectId: payment.id, labels: ['Testing'] },
    { title: 'UI Design Updated', status: TaskStatus.COMPLETED, dueDate: '2026-07-31', projectId: homepage.id, labels: ['Design'] },
    { title: 'Security Audit Scheduled', status: TaskStatus.COMPLETED, dueDate: '2026-08-01', projectId: payment.id, labels: ['Testing'] },
    { title: 'UI Review', status: TaskStatus.ON_HOLD, dueDate: '2026-08-02', projectId: homepage.id },
    { title: 'Backend Integration', status: TaskStatus.ON_HOLD, dueDate: '2026-08-03', projectId: login.id },
    { title: 'User Feedback Review', status: TaskStatus.ON_HOLD, dueDate: '2026-08-04', projectId: homepage.id },
    { title: 'Performance Optimization', status: TaskStatus.ON_HOLD, dueDate: '2026-08-05', projectId: payment.id },
    { title: 'Develop Login Feature', status: TaskStatus.TODO, priority: Priority.LOW, dueDate: '2026-09-15', projectId: login.id },
    { title: 'Test Payment Gateway', status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: '2026-09-18', projectId: payment.id },
  ];

  for (const t of moreTasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority ?? Priority.NO_PRIORITY,
        dueDate: new Date(t.dueDate),
        projectId: t.projectId,
        labels: t.labels ?? [],
        reporterId: dexter.id,
        assignees: { connect: [{ id: dexter.id }] },
      },
    });
  }

  console.log('Seed complete:', {
    users: 2,
    projects: 3,
    tasks: moreTasks.length + 1,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
