import { Injectable, signal } from '@angular/core';
import type { Event } from '../models/event';

export interface EventState {
  list: Event[];
  selected: Event | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class EventStore {
  private readonly state = signal<EventState>(initialState);

  readonly vm = this.state.asReadonly();

  setList(list: Event[]): void {
    this.state.update((s) => ({ ...s, list, loading: false, error: null }));
  }

  setSelected(selected: Event | null): void {
    this.state.update((s) => ({ ...s, selected, loading: false }));
  }

  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading }));
  }

  setError(error: string): void {
    this.state.update((s) => ({ ...s, error, loading: false }));
  }

  reset(): void {
    this.state.set(initialState);
  }
}
