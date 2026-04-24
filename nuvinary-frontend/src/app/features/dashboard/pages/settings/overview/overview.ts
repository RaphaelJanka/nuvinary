import { Component, computed, inject } from '@angular/core';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-overview',
  imports: [PageLayout, BaseChartDirective],
  templateUrl: './overview.html',
})
export class Overview {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.authUser;
  private readonly totalCredits = 10;
  protected readonly usedCredits = this.totalCredits - (this.user()?.credits || 0);

  protected readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#52525b', font: { size: 10, weight: 'bold' } },
      },
      y: { display: false, min: 0, max: 1.2 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
      },
    },

    interaction: { mode: 'index', intersect: false },
  };

  protected readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const userColor = this.user()?.avatarColor || '#F59E0B';
    const dataPoints = Array.from({ length: this.totalCredits }, (_, i) =>
      i < this.usedCredits ? 1 : 0,
    );

    return {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      datasets: [
        {
          data: dataPoints,
          label: 'Credit Usage',
          borderColor: userColor,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: userColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,

          // Der Glühen-Effekt (Gradient)
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

            gradient.addColorStop(0, this.hexToRgba(userColor, 0.25));
            gradient.addColorStop(1, this.hexToRgba(userColor, 0));

            return gradient;
          },
        },
      ],
    };
  });

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
