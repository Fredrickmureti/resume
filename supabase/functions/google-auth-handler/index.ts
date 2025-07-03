
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { access_token, user_email } = await req.json();

    if (!access_token || !user_email) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing access token or email',
          shouldRedirect: false 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Fetch Google user info using the access token
    const googleResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
    );

    if (!googleResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Google user info',
          shouldRedirect: false 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const googleUser: GoogleUserInfo = await googleResponse.json();
    console.log('Google user info:', googleUser);

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    if (profileError || !profile) {
      console.log('User not found in profiles table:', profileError);
      return new Response(
        JSON.stringify({ 
          error: 'No account found with this email. Please sign up with email and password first.',
          shouldRedirect: true,
          redirectMessage: 'Please create an account using email and password before using Google Sign-In.'
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if user has complete profile information (first name and last name)
    const fullName = profile.full_name || '';
    const nameParts = fullName.trim().split(' ');
    const hasFirstName = nameParts.length > 0 && nameParts[0].length > 0;
    const hasLastName = nameParts.length > 1 && nameParts[nameParts.length - 1].length > 0;

    if (!hasFirstName || !hasLastName) {
      console.log('User profile incomplete - missing first or last name');
      return new Response(
        JSON.stringify({ 
          error: 'Your profile is incomplete. Please sign in with email and password to complete your profile first.',
          shouldRedirect: true,
          redirectMessage: 'Please complete your profile by signing in with email and password first.'
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if user originally signed up with email/password by looking at auth metadata
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(profile.id);

    if (authError || !authUser.user) {
      console.log('Error fetching auth user:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication verification failed. Please try signing in with email and password.',
          shouldRedirect: true 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if user was originally created through email signup (not OAuth)
    const userMetadata = authUser.user.app_metadata || {};
    const providers = authUser.user.identities?.map(identity => identity.provider) || [];
    
    // If user has Google as their only provider, they signed up with Google originally
    if (providers.length === 1 && providers[0] === 'google') {
      console.log('User originally signed up with Google, not email/password');
      return new Response(
        JSON.stringify({ 
          error: 'This account was created with Google. Please sign in with email and password first to enable Google Sign-In.',
          shouldRedirect: true,
          redirectMessage: 'Please create an account using email and password before using Google Sign-In.'
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // If we reach here, all conditions are met - allow the sign-in
    console.log('Google Sign-In approved for user:', googleUser.email);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Google Sign-In approved',
        user: {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in Google auth handler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during authentication verification',
        shouldRedirect: false 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
