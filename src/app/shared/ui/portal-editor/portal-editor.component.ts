import { Component, computed, effect, inject, input, model, output, signal, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import type { EntityPortal } from '../../../entrepreneurship/models/entrepreneurship-portal';
import type { CatalogueValue } from '../../../shared-domain/models/catalogue-value';
import { ToastService } from '../toast/toast.service';

export interface PortalFormValue {
  subdomain: string;
  themeId: number | null;
  isActive: boolean;
  htmlContent: string;
}

export const OPENROUTER_MODELS: { id: string; label: string }[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (gratis)' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek V3 (gratis)' },
  { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (gratis)' },
  { id: 'qwen/qwen2.5-72b-instruct:free', label: 'Qwen 2.5 72B (gratis)' },
];

const AI_KEY_STORAGE = 'openrouter_api_key';
const AI_MODEL_STORAGE = 'openrouter_model';

@Component({
  selector: 'app-portal-editor',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './portal-editor.component.html',
  styleUrl: './portal-editor.component.scss',
})
export class PortalEditorComponent {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toastService = inject(ToastService);

  readonly portal = input<EntityPortal | null>(null);
  readonly themes = input<CatalogueValue[]>([]);
  readonly loading = input(false);
  readonly saving = input(false);

  readonly save = output<PortalFormValue>();
  readonly delete = output<void>();

  readonly models = OPENROUTER_MODELS;
  readonly form = model<PortalFormValue>({
    subdomain: '',
    themeId: null,
    isActive: true,
    htmlContent: '',
  });
  readonly previewOpen = signal(true);
  readonly fullscreen = signal(false);
  readonly layout = signal<'split' | 'code' | 'preview'>('split');
  readonly aiPrompt = signal('');
  readonly aiKey = signal(this.readStorage(AI_KEY_STORAGE));
  readonly aiModel = signal(this.readStorage(AI_MODEL_STORAGE) || OPENROUTER_MODELS[0].id);
  readonly aiLoading = signal(false);
  readonly aiError = signal<string | null>(null);

  readonly safeHtml = computed<SafeHtml>(() => {
    const content = this.form().htmlContent.trim();
    const body = content || '<div style="font-family:Inter,Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100%;color:#52525b;text-align:center;padding:24px;">Escribe o genera tu HTML para verlo aquí en vivo.<br/><small style="opacity:.6">Acepta HTML, CSS y JavaScript</small></div>';
    return this.sanitizer.bypassSecurityTrustHtml(body);
  });

  private readonly lastPortal = signal<EntityPortal | null | undefined>(undefined);

  private syncFromPortal = effect(() => {
    const p = this.portal();
    if (this.lastPortal() === p) return;
    this.lastPortal.set(p);
    this.form.set({
      subdomain: p?.subdomain ?? '',
      themeId: p?.themeId ?? null,
      isActive: p?.isActive ?? true,
      htmlContent: p?.htmlContent ?? '',
    });
  });

  update<K extends keyof PortalFormValue>(key: K, value: PortalFormValue[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  onSave(): void {
    this.save.emit(this.form());
  }

  onDelete(): void {
    this.delete.emit();
  }

  toggleFullscreen(): void {
    this.fullscreen.update(v => !v);
    document.body.style.overflow = this.fullscreen() ? 'hidden' : '';
  }

  setLayout(layout: 'split' | 'code' | 'preview'): void {
    this.layout.set(layout);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.fullscreen()) {
      this.toggleFullscreen();
    }
  }

  saveAiKey(): void {
    localStorage.setItem(AI_KEY_STORAGE, this.aiKey().trim());
    localStorage.setItem(AI_MODEL_STORAGE, this.aiModel());
    this.toastService.success('Clave de OpenRouter guardada en este navegador.');
  }

  async generateAi(): Promise<void> {
    this.aiError.set(null);
    const key = this.aiKey().trim();
    const prompt = this.aiPrompt().trim();
    if (!key) {
      this.aiError.set('Agrega tu API key de OpenRouter (gratis en openrouter.ai).');
      return;
    }
    if (!prompt) {
      this.aiError.set('Describe primero la página que quieres generar.');
      return;
    }
    this.aiLoading.set(true);
    try {
      const res: any = await lastValueFrom(
        this.http.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: this.aiModel(),
            messages: [
              {
                role: 'system',
                content:
                  'Eres un diseñador web experto. Genera el HTML completo y autónomo de la página pública que te piden (para la plataforma Emprendia). Usa CSS embebido dentro de <style> y JavaScript dentro de <script>. El diseño debe ser moderno, juvenil, elegante y 100% responsive (móvil primero). Devuelve ÚNICAMENTE el documento HTML completo desde <!DOCTYPE html> hasta </html>, sin markdown, sin comentarios explicativos.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Emprendia - Editor de Portal',
            },
          },
        ),
      );
      let html: string = res?.choices?.[0]?.message?.content ?? '';
      html = html.replace(/```html/gi, '').replace(/```/g, '').trim();
      if (!html) {
        this.aiError.set('La IA no devolvió contenido. Intenta de nuevo.');
        return;
      }
      this.form.update((f) => ({ ...f, htmlContent: html }));
      this.previewOpen.set(true);
      this.toastService.success('Portal generado. Revisa la vista previa y guarda.');
    } catch (err: any) {
      const status = err?.status;
      if (status === 401 || status === 403) {
        this.aiError.set('Clave inválida. Revisa tu API key de OpenRouter.');
      } else if (status === 402) {
        this.aiError.set('El modelo no está disponible gratis ahora. Prueba otro modelo.');
      } else if (status === 429) {
        this.aiError.set('Límite alcanzado. Espera un momento e intenta de nuevo.');
      } else {
        this.aiError.set('No se pudo conectar con la IA. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      this.aiLoading.set(false);
    }
  }

  private readStorage(key: string): string {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
