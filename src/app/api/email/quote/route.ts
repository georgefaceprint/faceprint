import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { jobId, toEmail, subject, message } = await request.json();

    if (!jobId || !toEmail) {
      return NextResponse.json({ error: 'Missing jobId or toEmail' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Configure Nodemailer Transport
    // These credentials must be added to your .env file
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const quoteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://faceprint-app.vercel.app'}/quotes/${job.id}`;

    const mailOptions = {
      from: `"FacePrint Sales" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: subject || `Your Quote from FacePrint (#${job.jobNumber || job.id.split('-')[0].toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #6d28d9;">Hello ${job.client.contactName},</h2>
          <p>${message || 'Thank you for requesting a quote from FacePrint. Please find your quote details below.'}</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px;">Quote Total: <strong>R ${job.totalAmount.toFixed(2)}</strong></p>
            <br/>
            <a href="${quoteLink}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View & Print Quote
            </a>
          </div>
          
          <p>If you have any questions, simply reply to this email.</p>
          <p>Best regards,<br/><strong>The FacePrint Team</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
