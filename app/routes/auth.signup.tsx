import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, ArrowRight, Sparkles, Github, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { getUser } from "~/lib/auth.server";
import { useState } from "react";
import supabase from "~/lib/supabase.client";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - DelphiX" },
    { name: "description", content: "Create your DelphiX research account" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) return redirect("/dashboard");
  
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
  
  return json({ redirectTo });
}

export default function SignUp() {
  const { redirectTo } = useLoaderData<typeof loader>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          // User is confirmed, redirect to dashboard
          window.location.href = redirectTo;
        } else {
          // User needs to confirm email
          setError("Please check your email and click the confirmation link to activate your account.");
        }
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch (err) {
      console.error("GitHub sign up error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md"
      >
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DelphiX</span>
          </Link>
          <h1 className="text-xl font-semibold text-white mb-2">Create your account</h1>
          <p className="text-white/60 text-sm">Join the future of research</p>
        </div>

        <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-white">Sign Up</CardTitle>
            <CardDescription className="text-white/60">
              Create your research workspace account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-white/80">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                    placeholder="Enter your full name"
                    className={cn(
                      "pl-10",
                      "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40",
                      "focus:bg-white/[0.08] focus:border-white/[0.2]",
                      error && "border-red-500/50"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/80">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className={cn(
                      "pl-10",
                      "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40",
                      "focus:bg-white/[0.08] focus:border-white/[0.2]",
                      error && "border-red-500/50"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
                    className={cn(
                      "pl-10",
                      "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40",
                      "focus:bg-white/[0.08] focus:border-white/[0.2]",
                      error && "border-red-500/50"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    className={cn(
                      "pl-10",
                      "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40",
                      "focus:bg-white/[0.08] focus:border-white/[0.2]",
                      error && "border-red-500/50"
                    )}
                  />
                </div>
              </div>

              <Button
                onClick={handleEmailSignUp}
                disabled={loading}
                className={cn(
                  "w-full mt-6",
                  "bg-gradient-to-r from-indigo-500 to-rose-500",
                  "text-white shadow-lg shadow-indigo-500/25",
                  "hover:shadow-xl hover:shadow-indigo-500/30",
                  "transition-all duration-300",
                  "disabled:opacity-50"
                )}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#030303] px-2 text-white/40">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGithubSignUp}
                disabled={loading}
                variant="outline"
                className={cn(
                  "w-full",
                  "bg-white/[0.02] border-white/[0.1] text-white",
                  "hover:bg-white/[0.05] hover:border-white/[0.2]",
                  "disabled:opacity-50"
                )}
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/60">
                Already have an account?{" "}
                <Link 
                  to="/auth/signin" 
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 