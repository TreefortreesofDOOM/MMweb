import { NextResponse } from "next/server"
import { Resend } from 'resend'
import { env } from '@/lib/constants/env'

// TODO: Change to noreply@meaningmachine.com after domain verification is complete
const resend = new Resend(env.RESEND_API_KEY)

interface EmailRequest {
  email: string
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json() as EmailRequest

    const { error: sendError } = await resend.emails.send({
      from: 'Meaning Machine <onboarding@resend.dev>',
      to: email,
      subject: 'Test Email from Meaning Machine',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from Meaning Machine to verify email functionality.</p>
        <p>If you received this email, the email system is working correctly.</p>
      `
    })

    if (sendError) {
      console.error('Error sending test email:', sendError)
      return NextResponse.json(
        { success: false, error: sendError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in test email endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 