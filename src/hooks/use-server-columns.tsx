import { useMemo } from 'react'
import { type ColumnDef, type Column } from '@tanstack/react-table'
import { Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      header: ({ column }) => <SortButton label="Sponsor / ISP" column={column} />,
    },
    {
      accessorKey: 'country',
      header: ({ column }) => <SortButton label="Country" column={column} />,
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">{countryFlag(row.original.cc)}</span>
          {row.getValue('country')}
        </span>
      ),
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
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs tabular-nums">
            {id}
            <Button
              variant="outline" size="icon" className="h-6 w-6 shrink-0"
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
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const id: string = row.original.id
        return (
          <a
            href={`https://www.speedtest.net/server/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <Button variant="default" size="sm" className="h-7 gap-1.5 px-3 text-xs shrink-0">
              <Play className="h-3 w-3" />
              Run speedtest
            </Button>
          </a>
        )
      },
    },
  ], [copiedId, copyId])
}
