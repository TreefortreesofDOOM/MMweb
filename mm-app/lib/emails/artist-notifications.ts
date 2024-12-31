import { createClient } from "@/lib/supabase/supabase-server"
import { Resend } from 'resend'
import { env } from '@/lib/env'

type NotificationType = 'submission' | 'approval' | 'rejection'

interface EmailNotification {
  userId: string
  email: string
  type: NotificationType
  rejectionReason?: string
}

interface EmailResponse {
  success: boolean
  error?: string
}

const resend = new Resend(env.RESEND_API_KEY)

export async function sendArtistApplicationEmail(
  notification: EmailNotification
): Promise<EmailResponse> {
  const subject = notification.type === 'submission'
    ? 'Your Artist Application Has Been Received'
    : notification.type === 'approval'
      ? 'Your Artist Application Has Been Approved'
      : 'Update on Your Artist Application'

  const content = notification.type === 'submission'
    ? `
      <h2>Application Received</h2>
      <p>Thank you for applying to become an artist on Meaning Machine.</p>
      <p>We have received your application and will review it shortly.</p>
      <p>We'll notify you once we've made a decision.</p>
    `
    : notification.type === 'approval'
      ? `
        <h2>Congratulations!</h2>
        <p>Your application to become an artist on Meaning Machine has been approved.</p>
        <p>You can now access the artist features and start uploading your artwork.</p>
        <p>Welcome to the Meaning Machine community!</p>
      `
      : `
        <h2>Application Update</h2>
        <p>Thank you for your interest in becoming an artist on Meaning Machine.</p>
        <p>After careful review, we regret to inform you that we cannot approve your application at this time.</p>
        ${notification.rejectionReason ? `<p><strong>Reason:</strong> ${notification.rejectionReason}</p>` : ''}
        <p>You're welcome to apply again in the future.</p>
      `

  try {
    // Send email using Resend
    const { error: sendError } = await resend.emails.send({
      from: 'Meaning Machine <noreply@meaningmachine.com>',
      to: notification.email,
      subject,
      html: content,
    })

    if (sendError) {
      console.error('Error sending email:', sendError)
      return { success: false, error: sendError.message }
    }

    // Update the notification status in the database
    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_notification_sent: new Date().toISOString(),
        last_notification_type: notification.type
      })
      .eq('id', notification.userId)

    if (updateError) {
      console.error('Error updating notification status:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in sendArtistApplicationEmail:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { success: false, error: errorMessage }
  }
}