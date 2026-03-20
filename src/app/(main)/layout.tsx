import { AppLayout } from "@/presentation/components/layout/AppLayout"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
