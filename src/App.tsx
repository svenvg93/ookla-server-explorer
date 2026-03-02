import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { Search, X, Zap, ServerOff, Info } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { ServerDetailSheet } from '@/components/server-detail-sheet'
import { AboutDialog } from '@/components/about-dialog'
import { ServersToolbar } from '@/components/servers-toolbar'
import { ServersPagination } from '@/components/servers-pagination'
import { useServerColumns } from '@/hooks/use-server-columns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { type Server } from '@/lib/types'
import { GITHUB_REPO_URL } from '@/lib/constants'

const multiWordFilter: FilterFn<Server> = (row, _columnId, filterValue: string) => {
  const words = filterValue.toLowerCase().split(/\s+/).filter(Boolean)
  const rowText = row.getAllCells().map(c => String(c.getValue() ?? '')).join(' ').toLowerCase()
  return words.every(w => rowText.includes(w))
}

export default function App() {
  const [allServers, setAllServers]         = useState<Server[]>([])
  const [query, setQuery]                   = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [aboutOpen, setAboutOpen]           = useState(false)
  const { copied: copiedId, copy: copyId } = useCopyToClipboard()

  // TanStack Table state
  const [sorting, setSorting]                   = useState<SortingState>(() => {
    const s = new URLSearchParams(window.location.search).get('sort')
    if (!s) return []
    const [id, dir] = s.split(':')
    return [{ id, desc: dir === 'desc' }]
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter]         = useState(() => new URLSearchParams(window.location.search).get('filter') ?? '')
  const [pagination, setPagination]             = useState<PaginationState>(() => {
    const p = new URLSearchParams(window.location.search)
    return {
      pageIndex: Number(p.get('page') ?? 0),
      pageSize:  Number(p.get('size') ?? 10),
    }
  })

  const fetchServers = useCallback(async (searchQuery: string) => {
    setLoading(true)
    setError(null)
    const trimmed = searchQuery.trim()
    const words = trimmed.split(/\s+/)
    const apiTerm = words[0] ?? ''
    const filterTerm = words.slice(1).join(' ')
    try {
      const url = '/api/servers' + (apiTerm ? '?search=' + encodeURIComponent(apiTerm) : '')
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
      setGlobalFilter(filterTerm)
      if (filterTerm) setQuery(apiTerm)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') ?? ''
    fetchServers(q)
  }, [fetchServers])

  // Sync state → URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (query)                params.set('q',      query)
    if (globalFilter)         params.set('filter', globalFilter)
    if (sorting.length > 0)   params.set('sort',   `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}`)
    if (pagination.pageIndex) params.set('page',   String(pagination.pageIndex))
    if (pagination.pageSize !== 10) params.set('size', String(pagination.pageSize))
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [query, globalFilter, sorting, pagination])

  const clearFilter = useCallback(() => {
    setGlobalFilter('')
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }, [])

  const handleRefresh = useCallback(() => fetchServers(query), [fetchServers, query])

  const columns = useServerColumns(copiedId, copyId)

  const table = useReactTable({
    data: allServers,
    columns,
    state: { sorting, columnVisibility, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: v => { setGlobalFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) },
    onPaginationChange: setPagination,
    globalFilterFn: multiWordFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const hasData = !loading && !error && allServers.length > 0

  const stats = useMemo(() => {
    const servers = table.getFilteredRowModel().rows.map(r => r.original)
    return {
      total: servers.length,
      countries: new Set(servers.map(s => s.cc)).size,
      isps: new Set(servers.map(s => s.sponsor)).size,
    }
  }, [table.getFilteredRowModel().rows]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ServerDetailSheet server={selectedServer} onClose={() => setSelectedServer(null)} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 h-14 flex items-center gap-3">
        <Zap className="h-4 w-4 text-primary shrink-0" />
        <h1 className="text-sm font-semibold tracking-tight">Speedtest Server Explorer</h1>
        <span className="text-muted-foreground/40 select-none">·</span>
        <span className="text-xs text-muted-foreground hidden sm:block">Browse & discover Speedtest servers worldwide</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setAboutOpen(true)}
            aria-label="About"
          >
            <Info className="h-4 w-4" />
          </Button>
          <ModeToggle />
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center p-2"
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-8 py-8 flex-1">
        {/* Search */}
        <TooltipProvider>
          <div className="flex gap-2 mb-6 max-w-2xl">
            <div className="relative flex-1">
              <Input

                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchServers(query)}
                placeholder="Search by ISP, operator, city… (e.g. Orange, Paris, Vodafone)"
                className={query ? 'pr-8' : undefined}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setGlobalFilter(''); fetchServers('') }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={() => fetchServers(query)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Loading…' : 'Search'}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" tabIndex={-1}>
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-64 text-xs leading-relaxed">
                <p className="font-medium mb-1">How search works</p>
                <p>The first word is sent to the Speedtest API to fetch matching servers. Any additional words refine the results locally — so <span className="font-mono">Orange France</span> fetches all Orange servers, then filters for France.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {!query
              ? 'Nearest to your location'
              : query.trim().includes(' ')
                ? 'First word searched via API · rest filtered locally'
                : 'Searching worldwide'
            }{' · '}results may be incomplete.
          </p>
        </TooltipProvider>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
            Error: {error}
          </div>
        )}

        {/* Toolbar - always mounted so the / keyboard shortcut stays active */}
        <div hidden={!hasData}>
          <ServersToolbar
            table={table}
            stats={stats}
            globalFilter={globalFilter}
            loading={loading}
            onRefresh={handleRefresh}
            onClearFilter={clearFilter}
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(header => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={header.id === 'sponsor' ? 'pl-8' : undefined}
                    >
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
                  <TableCell colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                      <ServerOff className="h-10 w-10 opacity-30" />
                      <p className="text-sm font-medium">No servers match your filter</p>
                      {globalFilter && (
                        <Button variant="outline" size="sm" onClick={clearFilter} className="gap-1.5">
                          <X className="h-3.5 w-3.5" />
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedServer(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={cell.column.id === 'sponsor' ? 'pl-8' : undefined}
                      >
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
        {hasData && <ServersPagination table={table} />}
      </main>

      <footer className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-4">
        <p className="text-xs text-muted-foreground text-center">
          This tool is not affiliated with, endorsed by, or connected to Ookla, LLC or Speedtest.net.
          Server data is sourced from the publicly available Speedtest server API.
          All trademarks belong to their respective owners.
        </p>
      </footer>
    </div>
  )
}
