import { runQuery } from '../config/database.js';

/**
 * Simulated email service - logs emails to database
 */

const EMAIL_TEMPLATES = {
    application_received: {
        subject: 'Your HUDT Application - {refNumber}',
        body: `Dear {fullName},

Thank you for applying to join Hallmark University Drama Troops (HUDT)!

Your application has been received and your reference number is: {refNumber}

Please save this reference number to check your application status at any time.

What happens next:
1. Our team will review your application within 48 hours
2. You'll receive an email with updates
3. If selected, you'll be invited for an audition

If you have any questions, please contact us at hudt@hallmarkuniversity.edu

Best regards,
HUDT Recruitment Team
🎭 Where Stars Are Born`
    },

    audition_scheduled: {
        subject: '🎭 Your HUDT Audition is Scheduled!',
        body: `Dear {fullName},

Great news! Your audition has been scheduled!

📅 Date & Time: {auditionSlot}
📍 Venue: Main Theatre Hall, Arts Building, Hallmark University

What to bring:
- A prepared monologue or performance piece (2-3 minutes)
- Comfortable clothing for movement
- Your student ID
- Water bottle
- Positive energy!

Tips for success:
- Arrive 15 minutes early
- Warm up your voice and body
- Be yourself and have fun!

Reference Number: {refNumber}

If you need to reschedule, please contact us at hudt@hallmarkuniversity.edu

Break a leg! 🌟
HUDT Recruitment Team`
    },

    accepted: {
        subject: '🎉 Congratulations! Welcome to HUDT!',
        body: `Dear {fullName},

CONGRATULATIONS! 🎭✨

We are thrilled to inform you that you have been ACCEPTED into Hallmark University Drama Troops!

Your talent and passion truly shone during the audition process, and we can't wait to have you as part of our family.

Next Steps:
1. Orientation Meeting: [Date TBD]
2. Complete member registration form
3. Join our WhatsApp group for updates
4. Get your official HUDT member badge

Your Reference Number: {refNumber}

Welcome to the stage where stars are born! 🌟

With excitement,
HUDT Leadership Team`
    },

    waitlisted: {
        subject: 'HUDT Application Update - Waitlisted',
        body: `Dear {fullName},

Thank you for auditioning for HUDT. Your performance was appreciated!

We want to inform you that you have been placed on our WAITLIST.

This means:
- We were impressed by your audition
- Due to limited spots, we couldn't offer immediate admission
- As spots become available, we will consider waitlisted applicants

Your Reference Number: {refNumber}

We encourage you to:
- Continue developing your talents
- Stay connected with HUDT events
- Consider re-applying next season

Thank you for your interest in HUDT.

Best regards,
HUDT Recruitment Team`
    },

    not_selected: {
        subject: 'Thank You for Your Interest in HUDT',
        body: `Dear {fullName},

Thank you for taking the time to audition for Hallmark University Drama Troops.

After careful consideration, we regret to inform you that we are unable to offer you a place at this time.

This decision was extremely difficult, as we had many talented applicants.

Please know that:
- Your effort and courage in auditioning are commendable
- This is not a reflection of your worth or talent
- We encourage you to continue pursuing your passion
- You are welcome to apply again in future seasons

Your Reference Number: {refNumber}

Keep shining! ✨

Warm regards,
HUDT Recruitment Team`
    },

    custom: {
        subject: '{subject}',
        body: '{body}'
    }
};

/**
 * Send an email (simulated - saves to database)
 */
export const sendEmail = async (applicationId, recipient, templateType, data) => {
    const template = EMAIL_TEMPLATES[templateType] || EMAIL_TEMPLATES.custom;

    let subject = template.subject;
    let body = template.body;

    // Replace placeholders
    const placeholders = {
        fullName: data.fullName || 'Applicant',
        refNumber: data.refNumber || 'N/A',
        auditionSlot: data.auditionSlot || 'TBD',
        subject: data.subject || '',
        body: data.body || ''
    };

    for (const [key, value] of Object.entries(placeholders)) {
        subject = subject.replace(new RegExp(`{${key}}`, 'g'), value);
        body = body.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    const now = new Date().toISOString();

    try {
        runQuery(`
      INSERT INTO email_logs (application_id, recipient, subject, body, sent_at, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [applicationId, recipient, subject, body, now, 'sent']);

        console.log(`📧 Email sent to ${recipient}: ${subject}`);

        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: 'Failed to send email' };
    }
};

/**
 * Get email history for an application
 */
export const getEmailHistory = (applicationId) => {
    return getAll(`
    SELECT * FROM email_logs WHERE application_id = ? ORDER BY sent_at DESC
  `, [applicationId]);
};

export { EMAIL_TEMPLATES };
