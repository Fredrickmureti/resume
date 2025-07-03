
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  fullName: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, confirmationUrl }: EmailRequest = await req.json();

    // For now, we'll just log the email content
    // You can integrate with Resend or another email service later
    console.log(`
      Welcome Email for: ${email}
      Name: ${fullName}
      Confirmation URL: ${confirmationUrl}
      
      Email HTML:
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ResumeAI Pro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ResumeAI Pro!</h1>
            <p>Your professional resume builder with AI-powered optimization</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>Thank you for joining ResumeAI Pro! You're just one step away from creating amazing, ATS-optimized resumes.</p>
            
            <p>To complete your registration and start building your perfect resume, please confirm your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">Confirm Email & Start Building</a>
            </div>
            
            <p>Once confirmed, you'll have access to:</p>
            <ul>
              <li>🎯 ATS-optimized resume templates</li>
              <li>🤖 AI-powered content suggestions</li>
              <li>📊 Real-time ATS scoring</li>
              <li>🔍 Keyword optimization tools</li>
              <li>📄 Professional PDF downloads</li>
            </ul>
            
            <p>If you didn't create this account, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The ResumeAI Pro Team</p>
          </div>
          <div class="footer">
            <p>© 2024 ResumeAI Pro. All rights reserved.</p>
            <p>Need help? Contact us at support@resumeaipro.com</p>
          </div>
        </div>
      </body>
      </html>
    `);

    return new Response(
      JSON.stringify({ success: true, message: "Email logged successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
