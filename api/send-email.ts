import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sesClient = new SESClient({
   region: process.env.AWS_REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { to, summary } = req.body;

  if (!to || !summary) {
    return res.status(400).json({ error: 'Faltan datos: to y summary son requeridos' });
  }

  try {
    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: 'Resumen de tareas - MateCode Tasks' },
        Body: {
          Text: { Data: summary },
        },
      },
    });

    await sesClient.send(command);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al enviar email:', error);
    return res.status(500).json({ error: 'No se pudo enviar el email' });
  }
}