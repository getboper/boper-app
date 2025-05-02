import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Invoice } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

type InvoiceStatusBadgeProps = {
  status: string;
};

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case "draft":
        return "draft";
      case "sent":
        return "sent";
      case "pending":
        return "pending";
      case "paid":
        return "paid";
      case "overdue":
        return "overdue";
      default:
        return "draft";
    }
  };

  const statusClass = getStatusClass(status);

  return (
    <span className={`invoice-status-badge ${statusClass}`}>
      {status}
    </span>
  );
}

type InvoiceTableProps = {
  invoices: Invoice[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkAsPaid: (id: number) => void;
  onSend: (id: number) => void;
  isLoading?: boolean;
};

export default function InvoiceTable({
  invoices,
  onView,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onSend,
  isLoading = false,
}: InvoiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <InvoiceTableSkeleton />
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">#{invoice.number}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(invoice.id)}>
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(invoice.id)}>
                        Edit
                      </DropdownMenuItem>
                      {invoice.status === "draft" && (
                        <DropdownMenuItem onClick={() => onSend(invoice.id)}>
                          Send
                        </DropdownMenuItem>
                      )}
                      {(invoice.status === "sent" || invoice.status === "pending") && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)}>
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(invoice.id)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No invoices found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function InvoiceTableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}
