import { Copy, Check, ExternalLink, Star } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Server } from '@/lib/types'
import { countryFlag } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

interface ServerDetailSheetProps {
  server: Server | null
  onClose: () => void
}

function CopyField({ label, value, href }: { label: string; value: string; href?: string }) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <p className="font-mono text-sm break-all flex-1">{value}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copy(value)}>
          {copied === value
            ? <Check className="h-3 w-3 text-emerald-500" />
            : <Copy className="h-3 w-3 text-muted-foreground" />}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ServerDetailSheet({ server, onClose }: ServerDetailSheetProps) {
  return (
    <Sheet open={!!server} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {server && (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <SheetTitle className="leading-snug">{server.sponsor}</SheetTitle>
                  <SheetDescription className="mt-0.5">
                    {server.name}, {server.country}
                  </SheetDescription>
                </div>
                {server.preferred ? (
                  <Badge variant="secondary" className="shrink-0 gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    Preferred
                  </Badge>
                ) : null}
              </div>
              <a
                href={`https://www.speedtest.net/server/${server.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex"
              >
                <Button className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Run speed test
                </Button>
              </a>
            </SheetHeader>

            <div className="space-y-5">
              {/* Identifiers */}
              <section className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Identifiers</h3>
                <CopyField label="Server ID" value={server.id} />
                <CopyField label="Host" value={server.host} />
                <CopyField label="Test URL" value={server.url} />
                <CopyField label="CLI command" value={`speedtest --server-id=${server.id}`} href="https://www.speedtest.net/apps/cli" />
              </section>

              <div className="border-t" />

              {/* Location */}
              <section className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Country">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{countryFlag(server.cc)}</span>
                      {server.country} ({server.cc})
                    </span>
                  </Field>
                  <Field label="City">{server.name}</Field>
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
