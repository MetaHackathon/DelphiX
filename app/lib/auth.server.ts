import { redirect } from "@remix-run/node";
import { createClient } from "./supabase.server";

export async function requireUser(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
  
  return user;
}

export async function getUser(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function createOrUpdateUserProfile(user: any) {
  const supabase = createClient();
  
  try {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('users')
        .update({
          email: user.email,
          full_name: user.user_metadata?.full_name || existingProfile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user profile:', error);
      }
    } else {
      // Create new profile
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error);
  }
} 