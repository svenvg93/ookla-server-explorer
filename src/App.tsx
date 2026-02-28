import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { Search, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Server {
  id: string
  name: string
  country: string
  cc: string
  sponsor: string
  host: string
  distance: number
  https_functional: number
  preferred: number
  isp_id: string
  lat: string
  lon: string
  url: string
}

function SortButton({ label, column }: { label: string; column: import('@tanstack/react-table').Column<Server> }) {
  const sorted = column.getIsSorted()
  return (
    <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(sorted === 'asc')}>
      {label}
      {sorted === 'asc'  ? <ArrowUp   className="ml-1 h-3 w-3" /> :
       sorted === 'desc' ? <ArrowDown className="ml-1 h-3 w-3" /> :
                           <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />}
    </Button>
  )
}

export default function App() {
  const [allServers, setAllServers]       = useState<Server[]>([])
  const [query, setQuery]                 = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [copiedId, setCopiedId]           = useState<string | null>(null)

  // TanStack Table state
  const [sorting, setSorting]                 = useState<SortingState>([])
  const [columnFilters, setColumnFilters]     = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter]       = useState('')
  const [pagination, setPagination]           = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const fetchServers = useCallback(async (searchQuery: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = '/api/servers' + (searchQuery ? '?search=' + encodeURIComponent(searchQuery) : '')
      const res = await fetch(url)
      const text = await res.text()
      let data: unknown
      try { data = JSON.parse(text) }
      catch { throw new Error('Not JSON: ' + text.slice(0, 150)) }
      if (!Array.isArray(data)) {
        const msg = (data as { error?: string })?.error
        throw new Error(msg ?? 'Unexpected response format')
      }
      setAllServers(data as Server[])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServers('') }, [fetchServers])

  function copyId(id: string) {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  const columns = useMemo<ColumnDef<Server>[]>(() => [
    {
      accessorKey: 'sponsor',
      header: ({ column }) => <SortButton label="Sponsor / ISP" column={column} />,
    },
    {
      accessorKey: 'country',
      header: ({ column }) => <SortButton label="Country" column={column} />,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortButton label="City" column={column} />,
      cell: ({ row }) => (
        <div>
          {row.original.preferred ? (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 align-middle" title="Preferred server" />
          ) : null}
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'host',
      header: 'Host',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue('host')}</span>
      ),
    },
{
      accessorKey: 'id',
      header: ({ column }) => <SortButton label="ID" column={column} />,
      cell: ({ row }) => {
        const id: string = row.getValue('id')
        return (
          <div className="flex items-center gap-2 text-muted-foreground text-xs tabular-nums">
            {id}
            <Button variant="outline" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyId(id)}>
              {copiedId === id
                ? <Check className="h-3 w-3 text-emerald-500" />
                : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )
      },
    },
  ], [copiedId, copyId])

  const preFiltered = useMemo(() => allServers.filter(s => {
    if (countryFilter !== 'all' && s.country !== countryFilter) return false
    return true
  }), [allServers, countryFilter])

  const table = useReactTable({
    data: preFiltered,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const COLUMN_LABELS: Record<string, string> = {
    id: 'ID', country: 'Country', name: 'City',
    sponsor: 'Sponsor / ISP', host: 'Host',
  }

  const countries = [...new Set(allServers.map(s => s.country))].sort()
  const hasData = !loading && !error && allServers.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 h-14 flex items-center gap-3">
        <Zap className="h-4 w-4 text-primary shrink-0" />
        <h1 className="text-sm font-semibold tracking-tight">Speedtest Server Explorer</h1>
        <span className="text-muted-foreground/40 select-none">·</span>
        <span className="text-xs text-muted-foreground hidden sm:block">Browse servers by ISP, operator or city</span>
        <a
          href="https://github.com/svenvg93/ookla-server-list"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          aria-label="GitHub repository"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </header>

      <main className="mx-auto max-w-screen-2xl px-8 py-8">
        {/* Search */}
        <div className="flex gap-2 mb-6 max-w-2xl">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchServers(query)}
            placeholder="Search by ISP, operator, city… (e.g. Orange, Paris, Vodafone)"
          />
          <Button onClick={() => fetchServers(query)} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Loading…' : 'Search'}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
            Error: {error}
          </div>
        )}

        {/* Toolbar */}
        {hasData && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm text-muted-foreground flex-1">
              {(() => {
                const { pageIndex, pageSize } = table.getState().pagination
                const total = table.getFilteredRowModel().rows.length
                const from = total === 0 ? 0 : pageIndex * pageSize + 1
                const to = Math.min((pageIndex + 1) * pageSize, total)
                return <>Showing <strong className="text-foreground">{from}–{to}</strong> of{' '}<strong className="text-foreground">{total}</strong> servers</>
              })()}
            </span>
            <Input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Filter results…"
              className="w-48"
            />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter(c => c.getCanHide()).map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={v => col.toggleVisibility(!!v)}
                  >
                    {COLUMN_LABELS[col.id] ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(header => (
                    <TableHead key={header.id} className={header.id === 'sponsor' ? 'pl-8' : undefined}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-20">
                    No servers match your filters
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className={cell.column.id === 'sponsor' ? 'pl-8' : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {hasData && (
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={v => table.setPageSize(Number(v))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 25].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t px-8 py-4 mt-8">
        <p className="text-xs text-muted-foreground text-center">
          This tool is not affiliated with, endorsed by, or connected to Ookla, LLC or Speedtest.net.
          Server data is sourced from the publicly available Speedtest server list.
          All trademarks belong to their respective owners.
        </p>
      </footer>
    </div>
  )
}
