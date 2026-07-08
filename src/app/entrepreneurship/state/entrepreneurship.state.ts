import { Injectable, signal } from '@angular/core';
import type { Entrepreneurship } from '../models/entrepreneurship';

export interface EntrepreneurshipState {
  list: Entrepreneurship[];
  selected: Entrepreneurship | null;
  loading: boolean;
  error: string | null;
}

const initialState: EntrepreneurshipState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class EntrepreneurshipStore {
  private readonly state = signal<EntrepreneurshipState>(initialState);

  readonly vm = this.state.asReadonly();

  setList(list: Entrepreneurship[]): void {
    this.state.update((s) => ({ ...s, list, loading: false, error: null }));
  }

  setSelected(selected: Entrepreneurship | null): void {
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
