import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, X } from 'lucide-angular';
import { Creation } from '../../../models/creation.model';

const INTRO_LINES = [
  'Behold, your masterpiece.',
  'Ta-da! Pixels assembled.',
  'Fresh out of the machine.',
  'One prompt, one vibe.',
];

const OUTRO_LINES = [
  'Pretty wild what a few words can do, huh?',
  'Not bad for a few seconds of work.',
  'Yours now. Do something great with it.',
  'Worth the wait? You tell us.',
];

const pickRandom = (lines: string[]): string => lines[Math.floor(Math.random() * lines.length)];

@Component({
  selector: 'app-creation-result-dialog',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './creation-result-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationResultDialog {
  protected readonly creation = inject<Creation>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);
  protected readonly icons = { closeIcon: X };
  protected readonly introLine = pickRandom(INTRO_LINES);
  protected readonly outroLine = pickRandom(OUTRO_LINES);
}
