
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  recipients: string[];
  title: string;
  content: string;
  messageType: string;
}

const getEmailTemplate = (title: string, content: string, messageType: string) => {
  const typeColors = {
    announcement: { bg: '#3B82F6', text: 'Announcement' },
    warning: { bg: '#F59E0B', text: 'Warning' },
    maintenance: { bg: '#EF4444', text: 'Maintenance' },
    feature: { bg: '#10B981', text: 'New Feature' }
  };

  const typeConfig = typeColors[messageType as keyof typeof typeColors] || typeColors.announcement;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ResumeAI Pro</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Professional Resume Builder</p>
        </div>
        
        <!-- Notification Badge -->
        <div style="padding: 20px; text-align: center;">
          <div style="display: inline-block; background-color: ${typeConfig.bg}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
            ${typeConfig.text}
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 30px 30px 30px;">
          <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            ${title}
          </h2>
          
          <div style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://kdzhvbchtxdmbnrazmjq.supabase.co/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Visit Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f7fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; margin: 0; text-align: center;">
            This notification was sent from ResumeAI Pro. If you no longer wish to receive these notifications, please update your preferences in your dashboard.
          </p>
          <p style="color: #a0aec0; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
            © 2024 ResumeAI Pro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, title, content, messageType }: NotificationEmailRequest = await req.json();

    console.log(`Sending notification email to ${recipients.length} recipients`);

    const emailHtml = getEmailTemplate(title, content, messageType);
    
    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (email) => {
        try {
          const emailResponse = await resend.emails.send({
            from: "ResumeAI Pro <notifications@resend.dev>",
            to: [email],
            subject: `${messageType === 'announcement' ? '📢' : messageType === 'warning' ? '⚠️' : messageType === 'maintenance' ? '🔧' : '✨'} ${title}`,
            html: emailHtml,
          });
          
          return { email, success: true, id: emailResponse.data?.id };
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return { email, success: false, error: error.message };
        }
      });
      
      const batchResults = await Promise.all(emailPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Email sending completed: ${successCount} success, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      sent: successCount,
      failed: failureCount,
      results: results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
