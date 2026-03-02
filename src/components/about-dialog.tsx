import { Zap, ExternalLink } from 'lucide-react'
import { GITHUB_REPO_URL } from '@/lib/constants'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="leading-none">Speedtest Server Explorer</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                Browse &amp; discover Speedtest servers worldwide
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* About */}
          <p className="text-muted-foreground leading-relaxed">
            A fast, searchable interface for exploring the public Speedtest server network.
            Find servers by ISP, city, or country, view their details, and launch a speed test in one click.
          </p>

          <div className="border-t" />

          {/* Links */}
          <section className="space-y-2.5">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View source on GitHub
            </a>
            <a
              href="https://github.com/alexjustesen/speedtest-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>
                Speedtest Tracker
                <span className="ml-1.5 text-xs text-muted-foreground/60">— self-hosted scheduled speed tests</span>
              </span>
            </a>
          </section>

          <div className="border-t" />

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Not affiliated with, endorsed by, or connected to Ookla, LLC or Speedtest.net.
            All trademarks belong to their respective owners.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
