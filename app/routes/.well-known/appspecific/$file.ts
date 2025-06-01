import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  // Silently respond to Chrome/other tooling probe requests under /.well-known/appspecific/*
  return json({}, { status: 204 });
} 