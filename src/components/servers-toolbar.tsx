import { useRef, useEffect } from 'react'
import { type Table } from '@tanstack/react-table'
import { RefreshCw, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Server } from '@/lib/types'

const COLUMN_LABELS: Record<string, string> = {
  id: 'ID', country: 'Country', name: 'City',
  sponsor: 'Sponsor / ISP', host: 'Host',
}

interface ServersToolbarProps {
  table: Table<Server>
  stats: { total: number; countries: number; isps: number }
  globalFilter: string
  loading: boolean
  onRefresh: () => void
  onClearFilter: () => void
}

export function ServersToolbar({
  table, stats, globalFilter, loading, onRefresh, onClearFilter,
}: ServersToolbarProps) {
  const filterRef = useRef<HTMLInputElement>(null)
  const { pageIndex, pageSize } = table.getState().pagination
  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        filterRef.current?.focus()
        filterRef.current?.select()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        <span className="text-sm text-muted-foreground">
          Showing <strong className="text-foreground">{from}–{to}</strong> of{' '}
          <strong className="text-foreground">{total}</strong>
        </span>
        <span className="text-muted-foreground/40 select-none text-sm">·</span>
        <Badge variant="secondary" className="font-normal gap-1">
          <span className="font-semibold">{stats.countries}</span> countries
        </Badge>
        <Badge variant="secondary" className="font-normal gap-1">
          <span className="font-semibold">{stats.isps}</span> ISPs
        </Badge>
      </div>
      <div className="relative">
        <Input
          ref={filterRef}
          value={globalFilter}
          onChange={e => table.setGlobalFilter(e.target.value)}
          placeholder="Filter by ISP, city, country…"
          className={cn('h-9 w-56', globalFilter && 'pr-7')}
        />
        {globalFilter && (
          <button
            onClick={onClearFilter}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Button
        variant="outline" size="icon" className="h-9 w-9 shrink-0"
        onClick={onRefresh} disabled={loading} aria-label="Refresh"
      >
        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
      </Button>
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
  )
}
