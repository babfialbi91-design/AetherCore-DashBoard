import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qaddtpaxktnufycydfzp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZGR0cGF4a3RudWZ5Y3lkZnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjk1MjIsImV4cCI6MjA5ODY0NTUyMn0.CBimAUTGv8XXL1hZAfXcwlOjtFUy9gGf9ILo5_6qiEI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
