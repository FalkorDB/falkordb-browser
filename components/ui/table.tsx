import * as React from "react"
import {
  Table as UITable,
  TableBody,
  TableCaption,
  TableCell as UITableCell,
  TableFooter as UITableFooter,
  TableHead as UITableHead,
  TableHeader as UITableHeader,
  TableRow as UITableRow,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  parentClassName?: string
  parentRef?: React.RefObject<HTMLDivElement | null>
  parentOnScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

// The browser's tables inherit their font size, and their scrolling wrapper is
// `#tableContent` — the element the virtualised table measures and the tests
// scroll.
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, parentClassName, parentRef, parentOnScroll, ...props }, ref) => (
    <UITable
      ref={ref}
      containerProps={{
        ref: parentRef,
        id: "tableContent",
        className: parentClassName,
        onScroll: parentOnScroll,
      }}
      className={cn("text-[length:inherit]", className)}
      {...props}
    />
  )
)
Table.displayName = "Table"

// The design system colours table rules with the border token, tints rows on
// hover and pads cells tighter; the browser's rules inherit the text colour,
// rows stay flat and cells are roomier.
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <UITableHeader ref={ref} className={cn("[&_tr]:border-current", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <UITableFooter ref={ref} className={cn("border-current bg-muted/50", className)} {...props} />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <UITableRow
    ref={ref}
    className={cn("border-current hover:bg-transparent data-[state=selected]:bg-transparent", className)}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <UITableHead ref={ref} className={cn("h-12 px-4", className)} {...props} />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <UITableCell ref={ref} className={cn("p-4", className)} {...props} />
))
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
