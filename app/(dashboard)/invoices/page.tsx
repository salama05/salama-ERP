import { InvoicesTable } from "@/components/dashboard/InvoicesTable";

export default function InvoicesPage() {
  return (
    <div className="min-h-screen">
      {/* Triggering recompile */}
      <InvoicesTable />
    </div>
  );
}
