import { useMemo } from 'react'
import { type ColumnDef, type Column, type FilterFn } from '@tanstack/react-table'

const arrIncludesValue: FilterFn<never> = (row, columnId, filterValues: string[]) =>
  filterValues.includes(row.getValue(columnId))
import { Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, Play, MoreHorizontal, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Server } from '@/lib/types'
import { countryFlag } from '@/lib/utils'

function SortButton({ label, column }: { label: string; column: Column<Server> }) {
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

export function useServerColumns(copiedId: string | null, copyId: (id: string) => void) {
  return useMemo<ColumnDef<Server>[]>(() => [
    {
      accessorKey: 'sponsor',
      size: 200,
      header: ({ column }) => <SortButton label="Sponsor / ISP" column={column} />,
      filterFn: arrIncludesValue,
    },
    {
      accessorKey: 'country',
      size: 160,
      header: ({ column }) => <SortButton label="Country" column={column} />,
      filterFn: arrIncludesValue,
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">{countryFlag(row.original.cc)}</span>
          {row.getValue('country')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      size: 150,
      header: ({ column }) => <SortButton label="City" column={column} />,
      filterFn: arrIncludesValue,
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
      size: 260,
      header: 'Host',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground block truncate">{row.getValue('host')}</span>
      ),
    },
    {
      accessorKey: 'id',
      size: 140,
      header: ({ column }) => <SortButton label="ID" column={column} />,
      cell: ({ row }) => {
        const id: string = row.getValue('id')
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="font-mono font-normal tabular-nums">
              {id}
            </Badge>
            <Button
              variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground"
              onClick={e => { e.stopPropagation(); copyId(id) }}
            >
              {copiedId === id
                ? <Check className="h-3 w-3 text-emerald-500" />
                : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      size: 60,
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const id: string = row.original.id
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={`https://www.speedtest.net/server/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  <Play className="h-3.5 w-3.5" />
                  Run speedtest
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(`speedtest --server-id=${id}`)
                }}
              >
                <Terminal className="h-3.5 w-3.5" />
                Copy CLI command
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [copiedId, copyId])
}
