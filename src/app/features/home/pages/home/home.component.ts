import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  BarChart3,
  Bell,
  ChartColumn,
  CircleDollarSign,
  Clock3,
  LucideAngularModule,
  MonitorCog,
  Package,
  Pencil,
  RefreshCcw,
  Users
} from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { Subscription } from 'rxjs';
import { GridStack } from 'gridstack';
import type { GridStackWidget } from 'gridstack';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import * as echarts from 'echarts/core';
import { BarChart, GaugeChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { AuthService } from '../../../../core/services/auth.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslatePipe } from '@ngx-translate/core';

type ChartKey = 'systemTrend' | 'ticketFlow' | 'moduleShare' | 'healthGauge';
type DashboardWidgetType = 'chart' | 'gauge' | 'modules' | 'activity' | 'quick';
type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

interface DashboardLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardWidget {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  type: DashboardWidgetType;
  layout: DashboardLayout;
  chartKey?: ChartKey;
}

interface HomeKpi {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: typeof CircleDollarSign;
}

interface QuickAccess {
  label: string;
  description: string;
  route: string;
  icon: typeof CircleDollarSign;
}

interface RecentActivity {
  title: string;
  detail: string;
  time: string;
  severity: TagSeverity;
}

interface ModuleStatus {
  name: string;
  owner: string;
  progress: number;
  status: string;
  severity: TagSeverity;
}

echarts.use([
  BarChart,
  GaugeChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
  CanvasRenderer
]);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    NgxEchartsDirective,
    ProgressBarModule,
    TagModule,
    TranslatePipe
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dashboardGrid') private dashboardGrid?: ElementRef<HTMLElement>;

  readonly bellIcon = Bell;
  readonly chartIcon = BarChart3;
  readonly clockIcon = Clock3;
  readonly editIcon = Pencil;
  readonly resetIcon = RefreshCcw;

  readonly chartInitOpts = {
    renderer: 'canvas'
  };

  readonly kpis: HomeKpi[] = [
    {
      label: 'Tickets activos',
      value: '128',
      helper: '32 pendientes criticos',
      trend: '+12% esta semana',
      icon: ChartColumn
    },
    {
      label: 'Usuarios operativos',
      value: '842',
      helper: 'Sesiones y permisos vigentes',
      trend: '+4.8% vs. mes anterior',
      icon: Users
    },
    {
      label: 'Procesos ERP',
      value: '96%',
      helper: 'Ejecucion promedio',
      trend: 'Estable',
      icon: MonitorCog
    },
    {
      label: 'Modulos disponibles',
      value: '6',
      helper: 'Accesos principales',
      trend: '100% publicados',
      icon: Package
    }
  ];

  readonly quickAccess: QuickAccess[] = [
    {
      label: 'Finanzas',
      description: 'Contable, SRI, caja y tesoreria.',
      route: '/main/modulo/finanzas/contable-sri',
      icon: CircleDollarSign
    },
    {
      label: 'RRHH',
      description: 'Empleado, proveedores y administracion.',
      route: '/main/modulo/rrhh/empleado',
      icon: Users
    },
    {
      label: 'Clientes',
      description: 'Comercial, vendedores y clientes.',
      route: '/main/modulo/clientes/comercial',
      icon: Users
    },
    {
      label: 'Producto',
      description: 'Produccion, distribucion y compras.',
      route: '/main/modulo/producto/produccion-distribucion',
      icon: Package
    },
    {
      label: 'Analisis',
      description: 'Indicadores, medicion y reportes.',
      route: '/main/modulo/analisis/am-r',
      icon: ChartColumn
    },
    {
      label: 'Sistema',
      description: 'Configuracion, soporte y developer.',
      route: '/main/modulo/sistema/configuracion',
      icon: MonitorCog
    }
  ];

  readonly recentActivity: RecentActivity[] = [
    {
      title: 'Ticket asignado',
      detail: 'Se asigno un nuevo caso de mantenimiento.',
      time: 'Hace 5 min',
      severity: 'warn'
    },
    {
      title: 'Empresa registrada',
      detail: 'Se agrego una nueva empresa al sistema.',
      time: 'Hoy',
      severity: 'success'
    },
    {
      title: 'Ubicacion actualizada',
      detail: 'Se modifico informacion de una ubicacion.',
      time: 'Ayer',
      severity: 'info'
    },
    {
      title: 'Permiso sincronizado',
      detail: 'Se actualizo el perfil de acceso de un usuario.',
      time: 'Lun',
      severity: 'secondary'
    }
  ];

  readonly moduleStatuses: ModuleStatus[] = [
    { name: 'Sistema', owner: 'Configuracion', progress: 96, status: 'Activo', severity: 'success' },
    { name: 'Help Desk', owner: 'Tickets', progress: 82, status: 'Atencion', severity: 'warn' },
    { name: 'Producto', owner: 'Produccion', progress: 74, status: 'Operativo', severity: 'info' },
    { name: 'Finanzas', owner: 'Contable', progress: 68, status: 'Revision', severity: 'secondary' }
  ];

  private readonly dashboardLayoutKey = 'abs_home_dashboard_layout';
  private readonly chartInstances = new Map<string, EChartsType>();
  private preferencesSubscription?: Subscription;
  private grid?: GridStack;
  private resizeObserver?: ResizeObserver;
  private resizeAnimationFrame: number | null = null;
  private resizeDebounceTimer?: ReturnType<typeof setTimeout>;
  private saveLayoutTimer?: ReturnType<typeof setTimeout>;

  readonly dashboardWidgets: DashboardWidget[] = this.createDashboardWidgets();
  chartOptions!: Record<ChartKey, EChartsCoreOption>;
  isDashboardEditing = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly preferencesService: PreferencesService,
    private readonly zone: NgZone,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.chartOptions = this.buildChartOptions();
  }

  ngOnInit(): void {
    this.preferencesSubscription = this.preferencesService.preferences$.subscribe((prefs) => {
      this.chartOptions = this.buildChartOptions();
      this.grid?.setAnimation(prefs.showAnimations && this.isDashboardEditing);
      this.resizeChartsSoon(120);
      this.changeDetector.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => this.initializeGrid());
    });
  }

  ngOnDestroy(): void {
    this.preferencesSubscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.clearResizeWork();
    this.clearSaveLayoutWork();
    this.grid?.destroy(false);
    this.chartInstances.clear();
  }

  get username(): string {
    return this.authService.getName() || localStorage.getItem('username') || 'Usuario';
  }

  get dashboardModeLabel(): string {
    return this.isDashboardEditing ? 'Edicion activa' : 'Dashboard bloqueado';
  }

  navigate(route: string): void {
    void this.router.navigateByUrl(route);
  }

  resetDashboardLayout(): void {
    if (!this.isDashboardEditing) {
      return;
    }

    localStorage.removeItem(this.dashboardLayoutKey);

    if (!this.grid) {
      return;
    }

    this.grid.batchUpdate();
    this.defaultWidgets().forEach((widget) => {
      const element = this.dashboardGrid?.nativeElement.querySelector(
        `[gs-id="${widget.id}"]`
      ) as HTMLElement | null;

      if (element) {
        this.grid?.update(element, { ...widget.layout, id: widget.id });
      }
    });
    this.grid.batchUpdate(false);
    this.saveGridLayout();
    this.resizeChartsSoon(80);
  }

  toggleDashboardEditing(): void {
    this.isDashboardEditing = !this.isDashboardEditing;
    this.syncGridEditingState();
  }

  onChartInit(instance: unknown, widgetId: string): void {
    this.chartInstances.set(widgetId, instance as EChartsType);
    this.resizeChartsSoon(80);
  }

  trackWidget(_: number, widget: DashboardWidget): string {
    return widget.id;
  }

  trackQuickAccess(_: number, item: QuickAccess): string {
    return item.route;
  }

  private initializeGrid(): void {
    const gridElement = this.dashboardGrid?.nativeElement;

    if (!gridElement) {
      return;
    }

    this.grid = GridStack.init(
      {
        column: 12,
        cellHeight: 112,
        margin: '18px 38px',
        float: false,
        animate: false,
        disableDrag: true,
        disableResize: true,
        draggable: {
          handle: '.widget-drag-handle'
        },
        resizable: {
          handles: 'e,se,s,sw,w'
        }
      },
      gridElement
    );

    this.grid.on('change', () => {
      if (this.isDashboardEditing) {
        this.saveGridLayoutSoon();
      }

      this.resizeChartsSoon(140);
    });

    this.grid.on('dragstop resizestop', () => {
      if (this.isDashboardEditing) {
        this.saveGridLayout();
      }

      this.resizeChartsSoon(60);
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resizeChartsSoon(160));
      this.resizeObserver.observe(gridElement);
    }

    this.resizeChartsSoon(120);
    this.syncGridEditingState();
  }

  private syncGridEditingState(): void {
    if (!this.grid) {
      return;
    }

    this.grid.enableMove(this.isDashboardEditing);
    this.grid.enableResize(this.isDashboardEditing);
    this.grid.setAnimation(this.preferencesService.snapshot.showAnimations && this.isDashboardEditing);
  }

  private saveGridLayout(): void {
    if (!this.grid) {
      return;
    }

    const savedItems = this.grid.save(false) as GridStackWidget[];
    const layout = savedItems
      .filter((item) => typeof item.id === 'string')
      .map((item) => ({
        id: String(item.id),
        x: item.x ?? 0,
        y: item.y ?? 0,
        w: item.w ?? 4,
        h: item.h ?? 3
      }));

    localStorage.setItem(this.dashboardLayoutKey, JSON.stringify(layout));
  }

  private saveGridLayoutSoon(): void {
    this.clearSaveLayoutWork();
    this.saveLayoutTimer = setTimeout(() => this.saveGridLayout(), 260);
  }

  private resizeChartsSoon(delay = 90): void {
    this.clearResizeWork();
    this.resizeDebounceTimer = setTimeout(() => {
      this.resizeAnimationFrame = requestAnimationFrame(() => {
        this.resizeAnimationFrame = null;
        this.chartInstances.forEach((instance) => instance.resize());
      });
    }, delay);
  }

  private clearResizeWork(): void {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = undefined;
    }

    if (this.resizeAnimationFrame !== null) {
      cancelAnimationFrame(this.resizeAnimationFrame);
      this.resizeAnimationFrame = null;
    }
  }

  private clearSaveLayoutWork(): void {
    if (this.saveLayoutTimer) {
      clearTimeout(this.saveLayoutTimer);
      this.saveLayoutTimer = undefined;
    }
  }

  private createDashboardWidgets(): DashboardWidget[] {
    const storedLayout = this.loadStoredLayout();

    return this.defaultWidgets().map((widget) => ({
      ...widget,
      layout: {
        ...widget.layout,
        ...(storedLayout[widget.id] ?? {})
      }
    }));
  }

  private defaultWidgets(): DashboardWidget[] {
    return [
      {
        id: 'system-trend',
        eyebrow: 'Resumen general',
        title: 'Actividad del sistema',
        subtitle: 'Usuarios, tickets y procesos por dia',
        type: 'chart',
        chartKey: 'systemTrend',
        layout: { x: 0, y: 0, w: 8, h: 4 }
      },
      {
        id: 'health-gauge',
        eyebrow: 'Indicadores',
        title: 'Salud operativa',
        subtitle: 'Disponibilidad ponderada del entorno ABS',
        type: 'gauge',
        chartKey: 'healthGauge',
        layout: { x: 8, y: 0, w: 4, h: 4 }
      },
      {
        id: 'ticket-flow',
        eyebrow: 'Help Desk',
        title: 'Flujo de tickets',
        subtitle: 'Entrada, resueltos y vencidos',
        type: 'chart',
        chartKey: 'ticketFlow',
        layout: { x: 0, y: 4, w: 6, h: 4 }
      },
      {
        id: 'module-share',
        eyebrow: 'Estado de modulos',
        title: 'Uso por modulo',
        subtitle: 'Distribucion mock de actividad ERP',
        type: 'chart',
        chartKey: 'moduleShare',
        layout: { x: 6, y: 4, w: 6, h: 4 }
      },
      {
        id: 'module-status',
        eyebrow: 'Operaciones',
        title: 'Estado de modulos',
        subtitle: 'Avance operativo por area',
        type: 'modules',
        layout: { x: 0, y: 8, w: 5, h: 4 }
      },
      {
        id: 'recent-activity',
        eyebrow: 'Auditoria',
        title: 'Actividad reciente',
        subtitle: 'Ultimos eventos relevantes',
        type: 'activity',
        layout: { x: 5, y: 8, w: 4, h: 4 }
      },
      {
        id: 'quick-access',
        eyebrow: 'Accesos rapidos',
        title: 'Modulos principales',
        subtitle: 'Rutas frecuentes del sistema',
        type: 'quick',
        layout: { x: 9, y: 8, w: 3, h: 4 }
      }
    ];
  }

  private loadStoredLayout(): Record<string, DashboardLayout> {
    const stored = localStorage.getItem(this.dashboardLayoutKey);

    if (!stored) {
      return {};
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return {};
      }

      return parsed.reduce<Record<string, DashboardLayout>>((layout, item) => {
        if (!item || typeof item !== 'object') {
          return layout;
        }

        const record = item as Record<string, unknown>;
        const id = typeof record['id'] === 'string' ? record['id'] : '';
        const x = this.readLayoutNumber(record['x']);
        const y = this.readLayoutNumber(record['y']);
        const w = this.readLayoutNumber(record['w']);
        const h = this.readLayoutNumber(record['h']);

        if (id && x !== null && y !== null && w !== null && h !== null) {
          layout[id] = { x, y, w, h };
        }

        return layout;
      }, {});
    } catch {
      localStorage.removeItem(this.dashboardLayoutKey);
      return {};
    }
  }

  private readLayoutNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private buildChartOptions(): Record<ChartKey, EChartsCoreOption> {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const animationsEnabled = this.preferencesService.snapshot.showAnimations;
    const chartMotion: EChartsCoreOption = animationsEnabled
      ? {
          animation: true,
          animationDuration: 420,
          animationDurationUpdate: 260,
          animationEasing: 'cubicOut',
          animationEasingUpdate: 'cubicOut',
          animationThreshold: 140
        }
      : {
          animation: false,
          animationDuration: 0,
          animationDurationUpdate: 0
        };
    const text = isDark ? '#e5e7eb' : '#1f2937';
    const muted = isDark ? '#94a3b8' : '#64748b';
    const gridLine = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.22)';
    const primary = '#c72026';
    const success = '#16a34a';
    const warning = '#f59e0b';
    const info = '#2563eb';

    return {
      systemTrend: {
        ...chartMotion,
        color: [primary, info, success],
        tooltip: { trigger: 'axis' },
        legend: { top: 0, textStyle: { color: muted } },
        grid: { left: 32, right: 16, top: 48, bottom: 28 },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
          axisLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: muted }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: muted }
        },
        series: [
          {
            name: 'Usuarios',
            type: 'line',
            smooth: true,
            symbolSize: 7,
            data: [620, 680, 702, 744, 780, 812, 842],
            areaStyle: { opacity: 0.11 }
          },
          {
            name: 'Tickets',
            type: 'line',
            smooth: true,
            symbolSize: 7,
            data: [84, 96, 108, 121, 118, 126, 128],
            areaStyle: { opacity: 0.08 }
          },
          {
            name: 'Procesos',
            type: 'line',
            smooth: true,
            symbolSize: 7,
            data: [72, 76, 81, 84, 88, 92, 96],
            areaStyle: { opacity: 0.08 }
          }
        ]
      },
      ticketFlow: {
        ...chartMotion,
        color: [primary, success, warning],
        tooltip: { trigger: 'axis' },
        legend: { top: 0, textStyle: { color: muted } },
        grid: { left: 32, right: 18, top: 48, bottom: 30 },
        xAxis: {
          type: 'category',
          data: ['Soporte', 'Equipos', 'Redes', 'Accesos', 'ERP'],
          axisLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: muted }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: muted }
        },
        series: [
          { name: 'Entrantes', type: 'bar', barMaxWidth: 18, data: [28, 42, 31, 24, 38] },
          { name: 'Resueltos', type: 'bar', barMaxWidth: 18, data: [24, 36, 26, 22, 34] },
          { name: 'Vencidos', type: 'bar', barMaxWidth: 18, data: [3, 5, 4, 2, 6] }
        ]
      },
      moduleShare: {
        ...chartMotion,
        color: [primary, info, success, warning, '#7c3aed', '#475569'],
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          right: 8,
          top: 'center',
          textStyle: { color: muted }
        },
        series: [
          {
            name: 'Actividad',
            type: 'pie',
            radius: ['52%', '74%'],
            center: ['38%', '52%'],
            avoidLabelOverlap: true,
            label: { color: text, formatter: '{b}' },
            labelLine: { lineStyle: { color: gridLine } },
            data: [
              { value: 28, name: 'Sistema' },
              { value: 24, name: 'Help Desk' },
              { value: 18, name: 'Producto' },
              { value: 12, name: 'Finanzas' },
              { value: 10, name: 'RRHH' },
              { value: 8, name: 'Clientes' }
            ]
          }
        ]
      },
      healthGauge: {
        ...chartMotion,
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            startAngle: 210,
            endAngle: -30,
            progress: { show: true, width: 12, itemStyle: { color: primary } },
            axisLine: {
              lineStyle: {
                width: 12,
                color: [[1, isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.18)']]
              }
            },
            pointer: { itemStyle: { color: primary } },
            axisTick: { show: false },
            splitLine: { distance: 4, length: 8, lineStyle: { color: gridLine } },
            axisLabel: { color: muted, distance: 18 },
            detail: {
              valueAnimation: animationsEnabled,
              formatter: '{value}%',
              color: text,
              fontSize: 28,
              fontWeight: 900,
              offsetCenter: [0, '48%']
            },
            title: { color: muted, offsetCenter: [0, '76%'], fontSize: 12 },
            data: [{ value: 94, name: 'Operativo' }]
          }
        ]
      }
    };
  }
}
