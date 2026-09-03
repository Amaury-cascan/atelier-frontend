import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

let registered = false;

export function ensureChartsRegistered() {
  if (registered) return;
  ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
  );
  registered = true;
}

export const chartFonts = {
  family: "'DM Sans', 'Montserrat', system-ui, sans-serif",
};

export const salonChartColors = [
  '#c17f59',
  '#6b8f71',
  '#7a6b9a',
  '#a86b7a',
  '#5f8a95',
  '#b0894a',
  '#4f9a7e',
  '#8a7a6b',
];
