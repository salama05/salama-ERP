import DemoLayout from "@/components/demo/DemoLayout";

/**
 * Layout for the demo route group.
 * This layout intentionally does NOT include ClerkProvider or ConvexClientProvider
 * because the demo entry page works without authentication.
 */
export default function DemoGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoLayout>{children}</DemoLayout>;
}
