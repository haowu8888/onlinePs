import type { FilterConfig } from '@/types/filter'

export class FilterRegistry {
  private filters = new Map<string, FilterConfig>()

  register(config: FilterConfig) {
    this.filters.set(config.id, config)
  }

  get(id: string): FilterConfig | undefined {
    return this.filters.get(id)
  }

  getAll(): FilterConfig[] {
    return Array.from(this.filters.values())
  }

  getByCategory(category: string): FilterConfig[] {
    return this.getAll().filter(f => f.category === category)
  }
}

export const filterRegistry = new FilterRegistry()
