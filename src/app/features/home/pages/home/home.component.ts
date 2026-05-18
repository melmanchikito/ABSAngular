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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
  minH?: number;
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
      label: 'HOME.KPI_ACTIVE_TICKETS',
      value: '128',
      helper: 'HOME.KPI_ACTIVE_TICKETS_HELPER',
      trend: 'HOME.KPI_ACTIVE_TICKETS_TREND',
      icon: ChartColumn
    },
    {
      label: 'HOME.KPI_OPERATIONAL_USERS',
      value: '842',
      helper: 'HOME.KPI_OPERATIONAL_USERS_HELPER',
      trend: 'HOME.KPI_OPERATIONAL_USERS_TREND',
      icon: Users
    },
    {
      label: 'HOME.KPI_ERP_PROCESSES',
      value: '96%',
      helper: 'HOME.KPI_ERP_PROCESSES_HELPER',
      trend: 'HOME.KPI_ERP_PROCESSES_TREND',
      icon: MonitorCog
    },
    {
      label: 'HOME.KPI_AVAILABLE_MODULES',
      value: '6',
      helper: 'HOME.KPI_AVAILABLE_MODULES_HELPER',
      trend: 'HOME.KPI_AVAILABLE_MODULES_TREND',
      icon: Package
    }
  ];

  readonly quickAccess: QuickAccess[] = [
    {
      label: 'SIDEBAR.FINANCE',
      description: 'HOME.QUICK_FINANCE_DESCRIPTION',
      route: '/main/modulo/finanzas/contable-sri',
      icon: CircleDollarSign
    },
    {
      label: 'SIDEBAR.HR',
      description: 'HOME.QUICK_HR_DESCRIPTION',
      route: '/main/modulo/rrhh/empleado',
      icon: Users
    },
    {
      label: 'SIDEBAR.CLIENTS',
      description: 'HOME.QUICK_CLIENTS_DESCRIPTION',
      route: '/main/modulo/clientes/comercial',
      icon: Users
    },
    {
      label: 'SIDEBAR.PRODUCT',
      description: 'HOME.QUICK_PRODUCT_DESCRIPTION',
      route: '/main/modulo/producto/produccion-distribucion',
      icon: Package
    },
    {
      label: 'SIDEBAR.ANALYSIS',
      description: 'HOME.QUICK_ANALYSIS_DESCRIPTION',
      route: '/main/modulo/analisis/am-r',
      icon: ChartColumn
    },
    {
      label: 'SIDEBAR.SYSTEM',
      description: 'HOME.QUICK_SYSTEM_DESCRIPTION',
      route: '/main/modulo/sistema/configuracion',
      icon: MonitorCog
    }
  ];

  readonly recentActivity: RecentActivity[] = [
    {
      title: 'HOME.ACTIVITY_TICKET_ASSIGNED',
      detail: 'HOME.ACTIVITY_TICKET_ASSIGNED_DETAIL',
      time: 'HOME.TIME_5_MIN',
      severity: 'warn'
    },
    {
      title: 'HOME.ACTIVITY_COMPANY_REGISTERED',
      detail: 'HOME.ACTIVITY_COMPANY_REGISTERED_DETAIL',
      time: 'HOME.TIME_TODAY',
      severity: 'success'
    },
    {
      title: 'HOME.ACTIVITY_LOCATION_UPDATED',
      detail: 'HOME.ACTIVITY_LOCATION_UPDATED_DETAIL',
      time: 'HOME.TIME_YESTERDAY',
      severity: 'info'
    },
    {
      title: 'HOME.ACTIVITY_PERMISSION_SYNCED',
      detail: 'HOME.ACTIVITY_PERMISSION_SYNCED_DETAIL',
      time: 'HOME.TIME_MONDAY',
      severity: 'secondary'
    }
  ];

  readonly moduleStatuses: ModuleStatus[] = [
    { name: 'SIDEBAR.SYSTEM', owner: 'SIDEBAR.CONFIGURATION', progress: 96, status: 'STATUS.ACTIVE', severity: 'success' },
    { name: 'HOME.MODULE_HELP_DESK', owner: 'HOME.MODULE_TICKETS', progress: 82, status: 'HOME.STATUS_ATTENTION', severity: 'warn' },
    { name: 'SIDEBAR.PRODUCT', owner: 'HOME.MODULE_PRODUCTION', progress: 74, status: 'HOME.STATUS_OPERATIONAL', severity: 'info' },
    { name: 'SIDEBAR.FINANCE', owner: 'HOME.MODULE_ACCOUNTING', progress: 68, status: 'HOME.STATUS_REVIEW', severity: 'secondary' }
  ];

  private readonly chartInstances = new Map<string, EChartsType>();
  private readonly dashboardLayoutKey = 'abs_home_dashboard_grid_layout_v3';
  private preferencesSubscription?: Subscription;
  private languageSubscription?: Subscription;
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
    private readonly translateService: TranslateService,
    private readonly zone: NgZone,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.chartOptions = this.buildChartOptions();
  }

  ngOnInit(): void {
    this.preferencesSubscription = this.preferencesService.preferences$.subscribe((prefs) => {
      this.chartOptions = this.buildChartOptions();
      this.resizeChartsSoon(120);
      this.changeDetector.markForCheck();
    });

    this.languageSubscription = this.translateService.onLangChange.subscribe(() => {
      this.chartOptions = this.buildChartOptions();
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
    this.languageSubscription?.unsubscribe();
    this.clearResizeWork();
    this.clearSaveLayoutWork();
    this.resizeObserver?.disconnect();
    this.grid?.destroy(false);
    this.chartInstances.clear();
  }

  get username(): string {
    return this.authService.getName() || localStorage.getItem('username') || this.translateService.instant('COMMON.USER');
  }

  get dashboardModeLabel(): string {
    return this.isDashboardEditing
      ? this.translateService.instant('HOME.MODE_EDITING')
      : this.translateService.instant('HOME.MODE_LOCKED');
  }

  navigate(route: string): void {
    void this.router.navigateByUrl(route);
  }

  resetDashboardLayout(): void {
    localStorage.removeItem(this.dashboardLayoutKey);

    if (!this.grid) {
      this.resizeChartsSoon(80);
      return;
    }

    this.grid.batchUpdate();
    this.defaultWidgets().forEach((widget) => {
      const element = this.findWidgetElement(widget.id);
      if (element) {
        this.grid?.update(element, { ...widget.layout, id: widget.id, minH: widget.minH });
      }
    });
    this.grid.batchUpdate(false);
    this.saveDashboardLayout();
    this.resizeChartsSoon(80);
  }

  toggleDashboardEditing(): void {
    this.isDashboardEditing = !this.isDashboardEditing;
    this.syncGridEditingState();
    if (!this.isDashboardEditing) {
      this.saveDashboardLayout();
    }
    this.resizeChartsSoon(80);
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

  getChartOptions(widget: DashboardWidget, fallback: ChartKey): EChartsCoreOption {
    return this.chartOptions[widget.chartKey ?? fallback];
  }

  private initializeGrid(): void {
    const element = this.dashboardGrid?.nativeElement;

    if (!element) {
      return;
    }

    this.grid = GridStack.init(
      {
        column: 12,
        cellHeight: 120,
        margin: '16px 19px',
        float: false,
        animate: false,
        disableDrag: true,
        disableResize: true,
        draggable: {
          handle: '.widget-head'
        },
        resizable: {
          handles: 'e,se,s,sw,w'
        },
        columnOpts: {
          breakpoints: [
            { w: 760, c: 1, layout: 'list' },
            { w: 1200, c: 1, layout: 'list' }
          ],
          layout: 'list'
        }
      },
      element
    );

    this.grid.on('change', () => {
      if (this.isDashboardEditing) {
        this.saveDashboardLayoutSoon();
      }

      this.resizeChartsSoon(120);
    });

    this.grid.on('dragstop resizestop', () => {
      if (this.isDashboardEditing) {
        this.saveDashboardLayout();
      }

      this.resizeChartsSoon(60);
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resizeChartsSoon(160));
      this.resizeObserver.observe(element);
    }

    this.syncGridEditingState();
    this.resizeChartsSoon(120);
  }

  private syncGridEditingState(): void {
    if (!this.grid) {
      return;
    }

    this.grid.enableMove(this.isDashboardEditing);
    this.grid.enableResize(this.isDashboardEditing);
    this.grid.setAnimation(this.preferencesService.snapshot.showAnimations && this.isDashboardEditing);
  }

  private saveDashboardLayoutSoon(): void {
    this.clearSaveLayoutWork();
    this.saveLayoutTimer = setTimeout(() => this.saveDashboardLayout(), 260);
  }

  private saveDashboardLayout(): void {
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
        h: item.h ?? 4
      }));

    localStorage.setItem(this.dashboardLayoutKey, JSON.stringify(layout));
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
    const storedLayout = this.loadStoredDashboardLayout();

    return this.defaultWidgets().map((widget) => ({
      ...widget,
      layout: storedLayout[widget.id] ?? widget.layout
    }));
  }

  private defaultWidgets(): DashboardWidget[] {
    return [
      {
        id: 'system-trend',
        eyebrow: 'HOME.WIDGET_SYSTEM_TREND_EYEBROW',
        title: 'HOME.WIDGET_SYSTEM_TREND_TITLE',
        subtitle: 'HOME.WIDGET_SYSTEM_TREND_SUBTITLE',
        type: 'chart',
        chartKey: 'systemTrend',
        layout: { x: 0, y: 0, w: 8, h: 4 },
        minH: 3
      },
      {
        id: 'health-gauge',
        eyebrow: 'HOME.WIDGET_HEALTH_EYEBROW',
        title: 'HOME.WIDGET_HEALTH_TITLE',
        subtitle: 'HOME.WIDGET_HEALTH_SUBTITLE',
        type: 'gauge',
        chartKey: 'healthGauge',
        layout: { x: 8, y: 0, w: 4, h: 4 },
        minH: 3
      },
      {
        id: 'ticket-flow',
        eyebrow: 'HOME.WIDGET_TICKET_FLOW_EYEBROW',
        title: 'HOME.WIDGET_TICKET_FLOW_TITLE',
        subtitle: 'HOME.WIDGET_TICKET_FLOW_SUBTITLE',
        type: 'chart',
        chartKey: 'ticketFlow',
        layout: { x: 0, y: 4, w: 6, h: 4 },
        minH: 3
      },
      {
        id: 'module-share',
        eyebrow: 'HOME.WIDGET_MODULE_SHARE_EYEBROW',
        title: 'HOME.WIDGET_MODULE_SHARE_TITLE',
        subtitle: 'HOME.WIDGET_MODULE_SHARE_SUBTITLE',
        type: 'chart',
        chartKey: 'moduleShare',
        layout: { x: 6, y: 4, w: 6, h: 4 },
        minH: 3
      },
      {
        id: 'module-status',
        eyebrow: 'HOME.WIDGET_MODULE_STATUS_EYEBROW',
        title: 'HOME.WIDGET_MODULE_STATUS_TITLE',
        subtitle: 'HOME.WIDGET_MODULE_STATUS_SUBTITLE',
        type: 'modules',
        layout: { x: 0, y: 8, w: 5, h: 5 },
        minH: 4
      },
      {
        id: 'recent-activity',
        eyebrow: 'HOME.WIDGET_RECENT_ACTIVITY_EYEBROW',
        title: 'HOME.WIDGET_RECENT_ACTIVITY_TITLE',
        subtitle: 'HOME.WIDGET_RECENT_ACTIVITY_SUBTITLE',
        type: 'activity',
        layout: { x: 5, y: 8, w: 4, h: 5 },
        minH: 4
      },
      {
        id: 'quick-access',
        eyebrow: 'HOME.WIDGET_QUICK_ACCESS_EYEBROW',
        title: 'HOME.WIDGET_QUICK_ACCESS_TITLE',
        subtitle: 'HOME.WIDGET_QUICK_ACCESS_SUBTITLE',
        type: 'quick',
        layout: { x: 9, y: 8, w: 3, h: 5 },
        minH: 4
      }
    ];
  }

  private findWidgetElement(widgetId: string): HTMLElement | null {
    return this.grid?.el.querySelector(`[gs-id="${widgetId}"]`) as HTMLElement | null;
  }

  private loadStoredDashboardLayout(): Record<string, DashboardLayout> {
    const stored = localStorage.getItem(this.dashboardLayoutKey);

    if (!stored) {
      return {};
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return {};
      }

      const validWidgetIds = new Set(this.defaultWidgetIds());

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

        if (validWidgetIds.has(id) && x !== null && y !== null && w !== null && h !== null) {
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

  private defaultWidgetIds(): string[] {
    return [
      'system-trend',
      'health-gauge',
      'ticket-flow',
      'module-share',
      'module-status',
      'recent-activity',
      'quick-access'
    ];
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
    const t = (key: string) => this.translateService.instant(key) as string;
    const rootFontSize = this.getRootFontSize();
    const chartFontSize = Math.round(rootFontSize * 0.82);

    return {
      systemTrend: {
        ...chartMotion,
        color: [primary, info, success],
        textStyle: { fontSize: chartFontSize },
        tooltip: { trigger: 'axis' },
        legend: { top: 0, textStyle: { color: muted, fontSize: chartFontSize } },
        grid: { left: 32, right: 16, top: 48, bottom: 28 },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [
            t('HOME.DAY_MON'),
            t('HOME.DAY_TUE'),
            t('HOME.DAY_WED'),
            t('HOME.DAY_THU'),
            t('HOME.DAY_FRI'),
            t('HOME.DAY_SAT'),
            t('HOME.DAY_SUN')
          ],
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
            name: t('HOME.CHART_USERS'),
            type: 'line',
            smooth: true,
            symbolSize: 7,
            data: [620, 680, 702, 744, 780, 812, 842],
            areaStyle: { opacity: 0.11 }
          },
          {
            name: t('HOME.CHART_TICKETS'),
            type: 'line',
            smooth: true,
            symbolSize: 7,
            data: [84, 96, 108, 121, 118, 126, 128],
            areaStyle: { opacity: 0.08 }
          },
          {
            name: t('HOME.CHART_PROCESSES'),
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
        textStyle: { fontSize: chartFontSize },
        tooltip: { trigger: 'axis' },
        legend: { top: 0, textStyle: { color: muted, fontSize: chartFontSize } },
        grid: { left: 32, right: 18, top: 48, bottom: 30 },
        xAxis: {
          type: 'category',
          data: [
            t('HOME.CATEGORY_SUPPORT'),
            t('HOME.CATEGORY_EQUIPMENT'),
            t('HOME.CATEGORY_NETWORKS'),
            t('HOME.CATEGORY_ACCESS'),
            'ERP'
          ],
          axisLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: muted }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: muted }
        },
        series: [
          { name: t('HOME.CHART_INCOMING'), type: 'bar', barMaxWidth: 18, data: [28, 42, 31, 24, 38] },
          { name: t('HOME.CHART_RESOLVED'), type: 'bar', barMaxWidth: 18, data: [24, 36, 26, 22, 34] },
          { name: t('HOME.CHART_OVERDUE'), type: 'bar', barMaxWidth: 18, data: [3, 5, 4, 2, 6] }
        ]
      },
      moduleShare: {
        ...chartMotion,
        color: [primary, info, success, warning, '#7c3aed', '#475569'],
        textStyle: { fontSize: chartFontSize },
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          right: 8,
          top: 'center',
          textStyle: { color: muted, fontSize: chartFontSize }
        },
        series: [
          {
            name: t('HOME.CHART_ACTIVITY'),
            type: 'pie',
            radius: ['52%', '74%'],
            center: ['38%', '52%'],
            avoidLabelOverlap: true,
            label: { color: text, formatter: '{b}' },
            labelLine: { lineStyle: { color: gridLine } },
            data: [
              { value: 28, name: t('SIDEBAR.SYSTEM') },
              { value: 24, name: t('HOME.MODULE_HELP_DESK') },
              { value: 18, name: t('SIDEBAR.PRODUCT') },
              { value: 12, name: t('SIDEBAR.FINANCE') },
              { value: 10, name: t('SIDEBAR.HR') },
              { value: 8, name: t('SIDEBAR.CLIENTS') }
            ]
          }
        ]
      },
      healthGauge: {
        ...chartMotion,
        textStyle: { fontSize: chartFontSize },
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
              fontSize: Math.round(rootFontSize * 1.75),
              fontWeight: 900,
              offsetCenter: [0, '48%']
            },
            title: { color: muted, offsetCenter: [0, '76%'], fontSize: chartFontSize },
            data: [{ value: 94, name: t('HOME.STATUS_OPERATIONAL') }]
          }
        ]
      }
    };
  }

  private getRootFontSize(): number {
    const parsed = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(parsed) ? parsed : 16;
  }
}
