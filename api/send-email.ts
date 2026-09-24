import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TaskSummary {
  title: string;
  description?: string;
  completed: boolean;
}

interface SummaryRequestBody {
  recipient: string;
  tasks: TaskSummary[];
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isValidTask(task: TaskSummary): boolean {
  return typeof task.title === 'string'
    && task.title.length <= 200
    && typeof task.completed === 'boolean'
    && (task.description === undefined || typeof task.description === 'string');
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método no permitido.' });
  }

  const body = request.body as Partial<SummaryRequestBody> | undefined;
  const recipient = typeof body?.recipient === 'string' ? body.recipient.trim() : '';
  const tasks = body?.tasks;

  if (!emailPattern.test(recipient)
    || !Array.isArray(tasks)
    || tasks.length > 100
    || !tasks.every(isValidTask)) {
    return response.status(400).json({ error: 'Los datos del resumen no son válidos.' });
  }

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;

  const taskRows = tasks.length > 0
    ? tasks.map((task) => `
        <li style="margin-bottom: 8px;">
          <strong>${task.completed ? '✓' : '○'} ${escapeHtml(task.title)}</strong>
          ${task.description ? `<br><span style="color: #555;">${escapeHtml(task.description)}</span>` : ''}
        </li>`).join('')
    : '<li>No tienes tareas registradas.</li>';

  const client = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await client.send(new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: { ToAddresses: [recipient] },
      Message: {
        Subject: { Data: 'Resumen de tus tareas | MateCode Tasks', Charset: 'UTF-8' },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Resumen de tus tareas</h1>
                <p>Completadas: <strong>${completed}</strong> · Pendientes: <strong>${pending}</strong></p>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <ul style="list-style: none; padding-left: 0;">${taskRows}</ul>
              </div>
            `,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Resumen de tus tareas\n\nCompletadas: ${completed}\nPendientes: ${pending}\n\n${tasks.map((task) => `${task.completed ? '[x]' : '[ ]'} ${task.title}`).join('\n') || 'No tienes tareas registradas.'}`,
          },
        },
      },
    }));

    return response.status(200).json({ message: 'Resumen enviado correctamente.' });
  } catch (error) {
    console.error('AWS SES error:', error);
    return response.status(500).json({ error: 'No se pudo enviar el resumen.' });
  }
}