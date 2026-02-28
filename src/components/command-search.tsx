import { useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Star } from 'lucide-react'

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

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  servers: Server[]
  onSelect: (server: Server) => void
}

export function CommandSearch({ open, onOpenChange, servers, onSelect }: CommandSearchProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        onOpenChange(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search servers by ISP, city, country, host…" />
      <CommandList>
        <CommandEmpty>No servers found.</CommandEmpty>
        <CommandGroup heading="Servers">
          {servers.map(server => (
            <CommandItem
              key={server.id}
              value={`${server.sponsor} ${server.name} ${server.country} ${server.host}`}
              onSelect={() => {
                onSelect(server)
                onOpenChange(false)
              }}
              className="flex items-center gap-2"
            >
              {server.preferred ? (
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 shrink-0" />
              ) : (
                <span className="w-3 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium">{server.sponsor}</span>
                <span className="text-muted-foreground ml-2 text-xs">{server.name}, {server.country}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground shrink-0">{server.id}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
