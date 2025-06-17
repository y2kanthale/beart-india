export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

const nodemailer = require('nodemailer');
import { NextResponse } from 'next/server';
//import nodemailer from 'nodemailer';

interface EmailRequestBody {
  formType: 'contact' | 'volunteer';
  name: string;
  email: string;
  message: string;
  phone?: string;
  subject?: string;
}

export async function POST(req: Request) {
  const body: EmailRequestBody = await req.json();
  const { formType, name, email, message, phone, subject } = body;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    return NextResponse.json(
      { success: false, error: 'Email configuration missing' },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Beart India" <${process.env.GMAIL_USER}>`,
    to: 'info@beartindia.com',
    subject: formType === 'volunteer' ? 'New Volunteer Form Submission' : 'New Contact Form Submission',
    html: `
      <h2>${formType === 'volunteer' ? 'Volunteer Form Submission' : 'Contact Form Submission'}</h2>
      <p><strong>Name:</strong> ${name}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Email:</strong> ${email}</p>
      ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
