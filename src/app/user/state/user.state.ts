import { Injectable, signal } from '@angular/core';
import type { UserProfile } from '../models/user-profile';

export interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly state = signal<UserState>(initialState);

  readonly vm = this.state.asReadonly();

  setProfile(profile: UserProfile): void {
    this.state.update((s) => ({ ...s, profile, loading: false, error: null }));
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
