import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface CountryComboboxProps {
  countries: string[]
  value: string[]
  onChange: (value: string[]) => void
}

export function CountryCombobox({ countries, value, onChange }: CountryComboboxProps) {
  const [open, setOpen] = useState(false)

  function toggle(country: string) {
    const next = value.includes(country)
      ? value.filter(c => c !== country)
      : [...value, country]
    onChange(next)
  }

  function remove(country: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(value.filter(c => c !== country))
  }

  const label = value.length === 0
    ? 'Country'
    : value.length === 1
      ? value[0]
      : `${value.length} countries`

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className={`h-9 gap-1.5 ${value.length > 0 ? 'border-primary text-primary' : ''}`}
          >
            {label}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country…" />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map(c => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => toggle(c)}
                    className="gap-2"
                  >
                    <Check className={`h-3.5 w-3.5 shrink-0 ${value.includes(c) ? 'opacity-100' : 'opacity-0'}`} />
                    {c}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.map(c => (
        <Badge key={c} variant="secondary" className="gap-1 pr-1 font-normal">
          {c}
          <button
            onClick={e => remove(c, e)}
            className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
            aria-label={`Remove ${c}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
