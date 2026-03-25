import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLandlordRoute = path.startsWith("/landlord");
  const isTenantRoute = path.startsWith("/tenant");

  // Redirect unauthenticated users to login
  if (!user && (isLandlordRoute || isTenantRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (user && (isLandlordRoute || isTenantRoute)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "tenant" && isLandlordRoute) {
      return NextResponse.redirect(new URL("/tenant/dashboard", request.url));
    }
    if (profile?.role === "landlord" && isTenantRoute) {
      return NextResponse.redirect(new URL("/landlord/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/landlord/:path*", "/tenant/:path*"],
};
