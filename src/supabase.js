// supabaseClient.js
const { createClient } = supabase;

// Initialize Supabase client
const SUPABASE_URL = "https://zzalsobevusrwlgyahaj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
class User {
  constructor(email) {
    this.name = "";
    this.age = "";
    this.email = email;
  }
}
export async function fetchUserEmail() {
  try {
    const { data: userData, error } = await supabaseClient.auth.getUser();
    return userData.user.email;
  } catch (error) {
    return null;
  }
}
