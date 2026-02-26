import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly titleService = inject(Title);
  protected readonly title = signal('Nuvinary');

  ngOnInit(): void {
    this.titleService.setTitle(this.title());
  }
}
