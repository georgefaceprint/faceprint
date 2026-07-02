import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps avoid some strict SSL errors on custom cPanel hosts
  }
});

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export function getBaseTemplate(content: string, title: string = 'FacePrint') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>\${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
        .header { background-color: #7e22ce; padding: 30px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .content { padding: 40px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .button { display: inline-block; background-color: #9333ea; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        h2 { color: #111827; font-size: 20px; margin-top: 0; }
        strong { color: #4c1d95; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FacePrint</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>FacePrint | 5 Beacon Street, Maboneng, New Doornfontein</p>
          <p>Tel: 081 393 6500 | Email: sales@faceprint.co.za</p>
          <p>&copy; ${new Date().getFullYear()} FacePrint. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const finalHtml = options.html ? getBaseTemplate(options.html, options.subject) : undefined;
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'FacePrint <sales@faceprint.co.za>',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      bcc: 'sales@faceprint.co.za',
      subject: options.subject,
      text: options.text,
      html: finalHtml,
      attachments: options.attachments,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
