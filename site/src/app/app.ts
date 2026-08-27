import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root shell. Header and footer (02 §3) are built in Phase 3 alongside the
 * real routes — this stays deliberately thin until then.
 *
 * OnPush is the project-wide default, not an exception (06 §7, 09 §5).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
