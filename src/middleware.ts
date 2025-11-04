export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/home/:path*", "/add-word/:path*", "/all-words/:path*"],
};
