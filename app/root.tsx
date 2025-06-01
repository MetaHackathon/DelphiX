import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { LandingNav } from "~/components/ui/landing-nav";
import { AppNav } from "~/components/ui/app-nav";
import { useAuth } from "~/components/auth-guard";
import { getUser, getUserProfile } from "~/lib/auth.server";
import { setCurrentUser } from "~/lib/api";
import { useEffect } from "react";
import stylesheet from "~/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  let userProfile = null;
  
  if (user) {
    userProfile = await getUserProfile(user.id);
  }
  
  return json({
    user: userProfile ? {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.full_name || userProfile.email,
      user_metadata: { full_name: userProfile.full_name },
    } : null,
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#030303]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function NavigationWrapper() {
  const { user: clientUser, loading } = useAuth();
  
  // Don't render nav while auth is loading
  if (loading) {
    return null;
  }
  
  return clientUser ? <AppNav user={clientUser} /> : <LandingNav />;
}

export default function App() {
  // Set current user for API calls
  useEffect(() => {
    setCurrentUser();
  }, []);

  return (
    <>
      <NavigationWrapper />
      <Outlet />
    </>
  );
}
