import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createClient } from "~/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createClient();
  
  await supabase.auth.signOut();
  
  return redirect("/");
}

export async function loader() {
  return redirect("/");
} 