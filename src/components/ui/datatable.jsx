import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  ArrowUpDown,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate more sample data
const generateData = (count) => {
  const statuses = ["sucesso", "processando", "falhou"];
  const names = [
    "João",
    "Maria",
    "Roberto",
    "Ana",
    "Carlos",
    "Daniel",
    "Eduarda",
    "Fernando",
    "Gabriela",
    "Henrique",
  ];
  const lastNames = [
    "Silva",
    "Santos",
    "Oliveira",
    "Souza",
    "Pereira",
    "Ferreira",
    "Almeida",
    "Costa",
    "Rodrigues",
    "Martins",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    name: `${names[Math.floor(Math.random() * names.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`,
    email: `usuario${i + 1}@exemplo.com`,
    amount: Math.floor(Math.random() * 1000) + 50,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    date: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      .toISOString()
      .split("T")[0],
  }));
};

// Generate 50 records for pagination
const data = generateData(50);

export function DataTable() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // For filter selection
  const [activeFilter, setActiveFilter] = useState("email");
  const [filterValue, setFilterValue] = useState("");

  // Column definitions
  const columns = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <div className="text-left font-medium">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className={`hover:no-underline hover:font-bold p-0 h-auto ${
                column.getIsSorted() ? "font-bold" : ""
              }`}
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="text-left font-medium">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className={`hover:no-underline hover:font-bold p-0 h-auto ${
                column.getIsSorted() ? "font-bold" : ""
              }`}
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <div className="text-left font-medium">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className={`hover:no-underline hover:font-bold p-0 h-auto ${
                column.getIsSorted() ? "font-bold" : ""
              }`}
            >
              E-mail
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <div className="text-left font-medium">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className={`hover:no-underline hover:font-bold p-0 h-auto ${
                column.getIsSorted() ? "font-bold" : ""
              }`}
            >
              Data
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div className="text-left font-medium">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className={`hover:no-underline hover:font-bold p-0 h-auto ${
                column.getIsSorted() ? "font-bold" : ""
              }`}
            >
              Valor
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(amount);
        return formatted;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div className="text-left font-medium">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className={`hover:no-underline hover:font-bold p-0 h-auto ${
                column.getIsSorted() ? "font-bold" : ""
              }`}
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <div className="flex w-[110px] items-center">
            <Badge
              className={
                status === "sucesso"
                  ? "bg-green-500"
                  : status === "processando"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-left font-medium">Ações</div>,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copiar ID do pagamento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem>Ver histórico de pagamento</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Filter options for the dropdown
  const filterableColumns = [
    { value: "email", label: "E-mail" },
    { value: "name", label: "Nome" },
    { value: "status", label: "Status" },
  ];

  // Status options for status filter
  const statusOptions = [
    { value: "sucesso", label: "Sucesso" },
    { value: "processando", label: "Processando" },
    { value: "falhou", label: "Falhou" },
  ];

  // Handle filter change
  const handleFilterChange = (value) => {
    setFilterValue(value);

    // Clear previous filters for this column
    const updatedFilters = columnFilters.filter(
      (filter) => filter.id !== activeFilter
    );

    // Add new filter if value is not empty
    if (value) {
      updatedFilters.push({
        id: activeFilter,
        value: activeFilter === "status" ? [value] : value,
      });
    }

    setColumnFilters(updatedFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setColumnFilters([]);
    setFilterValue("");
  };

  // Handle new record
  const handleNewRecord = () => {
    // This would typically open a form or modal to create a new record
    alert("Adicionar novo registro");
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  return (
    <div>
      {/* Filter controls - fully responsive */}
      <div className="flex flex-col gap-3 py-4">
        {/* Filter controls */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              <Select
                value={activeFilter}
                onValueChange={(value) => {
                  setActiveFilter(value);
                  setFilterValue("");
                  // Remove existing filter for the previously selected column
                  const updatedFilters = columnFilters.filter(
                    (filter) => filter.id !== activeFilter
                  );
                  setColumnFilters(updatedFilters);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] flex items-center">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 flex-shrink-0" />
                    <SelectValue
                      placeholder="Selecionar filtro"
                      className="flex-grow text-left"
                    />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filterableColumns.map((column) => (
                    <SelectItem key={column.value} value={column.value}>
                      {column.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFilter === "status" ? (
                <Select value={filterValue} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={`Filtrar por ${
                    filterableColumns.find((col) => col.value === activeFilter)
                      ?.label
                  }...`}
                  value={filterValue}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full sm:flex-1"
                />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Colunas
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === "name"
                            ? "Nome"
                            : column.id === "amount"
                            ? "Valor"
                            : column.id === "date"
                            ? "Data"
                            : column.id === "actions"
                            ? "Ações"
                            : column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>

              {columnFilters.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-9 px-4 transition-colors hover:bg-red-100 hover:text-red-600 hover:border-red-300"
                >
                  Limpar
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              variant="default"
              onClick={handleNewRecord}
              className="h-9 px-4"
            >
              Novo
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table with horizontal scroll on small screens */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Improved responsive pagination */}
      <div className="py-4">
        {/* Mobile pagination layout */}
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Linhas</p>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop pagination layout */}
        <div className="hidden sm:flex sm:items-center sm:justify-end space-x-2">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Linhas por página</p>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[120px] items-center justify-center text-sm font-medium whitespace-nowrap">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
