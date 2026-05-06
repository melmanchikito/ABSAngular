import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChartColumn,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Database,
  Factory,
  FileBarChart,
  FileCheck2,
  FileText,
  FolderKanban,
  Gauge,
  Handshake,
  HardDrive,
  Landmark,
  LayoutDashboard,
  LineChart,
  MapPin,
  MonitorCog,
  Package,
  ReceiptText,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  TicketCheck,
  Truck,
  Users,
  Wrench
} from 'lucide-angular';
import {
  SystemAreaCategory,
  SystemAreaConfig,
  SystemAreaKey
} from '../models/system-area.model';

const systemCategories: SystemAreaCategory[] = [
  {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    icon: Wrench,
    description: 'Catálogos y parámetros del sistema',
    options: [
      { label: 'Empresas', description: 'Administración de empresas registradas.', icon: Building2 },
      { label: 'Entidades', description: 'Gestión de entidades relacionadas.', icon: Landmark },
      { label: 'Proveedores', description: 'Registro y control de proveedores.', icon: Handshake },
      { label: 'Ubicaciones', description: 'Configuración de ubicaciones físicas.', icon: MapPin },
      { label: 'Tipos de equipos', description: 'Clasificación de equipos.', icon: HardDrive },
      { label: 'Grupos', description: 'Agrupación de elementos del sistema.', icon: Boxes },
      { label: 'Marcas', description: 'Mantenimiento de marcas.', icon: Tags },
      { label: 'Modelos', description: 'Mantenimiento de modelos.', icon: Package },
      { label: 'Segmentación', description: 'Definición de segmentos internos.', icon: FolderKanban },
      { label: 'Permisos de antivirus', description: 'Control de permisos relacionados a antivirus.', icon: ShieldCheck },
      { label: 'Permisos de internet', description: 'Control de accesos a internet.', icon: MonitorCog },
      { label: 'Software', description: 'Registro de software disponible.', icon: Database },
      { label: 'Categoría', description: 'Clasificación por categorías.', icon: ClipboardList },
      { label: 'Problemas', description: 'Catálogo de problemas frecuentes.', icon: TicketCheck },
      { label: 'Opciones', description: 'Parámetros generales del sistema.', icon: Settings }
    ]
  },
  {
    key: 'documentos',
    label: 'Documentos',
    icon: FileText,
    description: 'Gestión documental interna',
    options: [
      { label: 'Documentos generales', description: 'Consulta de documentos internos.', icon: FileText },
      { label: 'Solicitudes', description: 'Gestión de solicitudes documentales.', icon: ClipboardList },
      { label: 'Formatos internos', description: 'Plantillas y formatos institucionales.', icon: ScrollText },
      { label: 'Actas', description: 'Registro y consulta de actas.', icon: FileCheck2 }
    ]
  },
  {
    key: 'procesos',
    label: 'Procesos',
    icon: Settings,
    description: 'Flujos operativos del sistema',
    options: [
      { label: 'Bitácora de asistencia', description: 'Registro de asistencias del personal.', icon: ClipboardCheck },
      { label: 'Control de datos por usuario', description: 'Control de información asociada a usuarios.', icon: Users },
      { label: 'Ingreso de componentes', description: 'Registro de componentes nuevos.', icon: Package },
      { label: 'Mantenimiento de componentes', description: 'Gestión y actualización de componentes.', icon: Wrench },
      { label: 'Validación de ingreso de componentes', description: 'Revisión y validación de componentes ingresados.', icon: ClipboardCheck },
      { label: 'Entrega y ajuste de equipos', description: 'Control de entrega y ajustes técnicos.', icon: Truck },
      { label: 'Mantenimiento de equipos', description: 'Seguimiento de mantenimiento técnico.', icon: HardDrive },
      {
        label: 'HelpDesk',
        description: 'Registro y seguimiento de tickets de soporte.',
        icon: TicketCheck,
        route: '/main/helpdesk'
      }
    ]
  },
  {
    key: 'informes',
    label: 'Informes',
    icon: BarChart3,
    description: 'Reportes y consultas',
    options: [
      { label: 'Historial de equipos', description: 'Consulta histórica de equipos.', icon: FileBarChart },
      { label: 'TOP de asistencias soporte', description: 'Ranking de asistencias realizadas.', icon: ChartColumn },
      { label: 'Informe Tickets', description: 'Reporte general de tickets.', icon: TicketCheck },
      { label: 'Informe de Horas', description: 'Reporte de horas registradas.', icon: Gauge }
    ]
  }
];

export const SYSTEM_AREA_CONFIG: Record<SystemAreaKey, SystemAreaConfig> = {
  sistema: {
    key: 'sistema',
    title: 'Área del Sistema',
    subtitle: 'Selecciona una categoría para visualizar sus opciones disponibles.',
    icon: MonitorCog,
    categories: systemCategories
  },
  gerencial: {
    key: 'gerencial',
    title: 'Área Gerencial',
    subtitle: 'Consulta indicadores, decisiones ejecutivas y controles gerenciales.',
    icon: ChartColumn,
    categories: [
      {
        key: 'mantenimientos',
        label: 'Mantenimientos',
        icon: Wrench,
        description: 'Parámetros de gestión ejecutiva',
        options: [
          { label: 'Unidades de negocio', description: 'Estructura de análisis gerencial.', icon: Building2 },
          { label: 'Metas corporativas', description: 'Definición de objetivos por periodo.', icon: Gauge },
          { label: 'Indicadores KPI', description: 'Configuración de indicadores clave.', icon: LineChart }
        ]
      },
      {
        key: 'documentos',
        label: 'Documentos',
        icon: FileText,
        description: 'Documentación gerencial',
        options: [
          { label: 'Actas de comité', description: 'Registro de reuniones directivas.', icon: FileCheck2 },
          { label: 'Políticas ejecutivas', description: 'Normas y directrices gerenciales.', icon: ScrollText }
        ]
      },
      {
        key: 'procesos',
        label: 'Procesos',
        icon: Settings,
        description: 'Flujos de aprobación y seguimiento',
        options: [
          { label: 'Aprobaciones gerenciales', description: 'Validación de decisiones críticas.', icon: ClipboardCheck },
          { label: 'Seguimiento estratégico', description: 'Control de iniciativas prioritarias.', icon: LayoutDashboard }
        ]
      },
      {
        key: 'informes',
        label: 'Informes',
        icon: BarChart3,
        description: 'Reportes ejecutivos',
        options: [
          { label: 'Dashboard gerencial', description: 'Resumen ejecutivo de indicadores.', icon: ChartColumn },
          { label: 'Rentabilidad por área', description: 'Análisis financiero por unidad.', icon: CircleDollarSign },
          { label: 'Cumplimiento de metas', description: 'Avance de objetivos estratégicos.', icon: FileBarChart }
        ]
      }
    ]
  },
  operativa: {
    key: 'operativa',
    title: 'Área Operativa',
    subtitle: 'Gestiona procesos de ventas, logística, clientes y operación diaria.',
    icon: Settings,
    categories: [
      {
        key: 'mantenimientos',
        label: 'Mantenimientos',
        icon: Wrench,
        description: 'Catálogos operativos',
        options: [
          { label: 'Clientes', description: 'Registro y administración de clientes.', icon: Users },
          { label: 'Productos', description: 'Catálogo operativo de productos.', icon: Package },
          { label: 'Bodegas', description: 'Ubicaciones logísticas y almacenes.', icon: Boxes }
        ]
      },
      {
        key: 'documentos',
        label: 'Documentos',
        icon: FileText,
        description: 'Documentación operativa',
        options: [
          { label: 'Órdenes de compra', description: 'Documentos de adquisición.', icon: ReceiptText },
          { label: 'Guías de despacho', description: 'Soporte de entrega y logística.', icon: Truck },
          { label: 'Reclamos de clientes', description: 'Registro documental de atención.', icon: ClipboardList }
        ]
      },
      {
        key: 'procesos',
        label: 'Procesos',
        icon: Settings,
        description: 'Operación diaria',
        options: [
          { label: 'Ventas', description: 'Gestión de flujo comercial.', icon: BriefcaseBusiness },
          { label: 'Compras', description: 'Control de solicitudes y adquisiciones.', icon: ReceiptText },
          { label: 'Logística y bodega', description: 'Movimientos y despacho de productos.', icon: Truck },
          { label: 'Servicio al cliente', description: 'Atención y seguimiento de casos.', icon: Users }
        ]
      },
      {
        key: 'informes',
        label: 'Informes',
        icon: BarChart3,
        description: 'Reportes operativos',
        options: [
          { label: 'Ventas por periodo', description: 'Resumen comercial por fechas.', icon: ChartColumn },
          { label: 'Rotación de inventario', description: 'Análisis de movimiento de stock.', icon: Boxes },
          { label: 'Indicadores de servicio', description: 'Métricas de atención al cliente.', icon: Gauge }
        ]
      }
    ]
  },
  administrativa: {
    key: 'administrativa',
    title: 'Área Administrativa',
    subtitle: 'Administra recursos, documentos internos y procesos institucionales.',
    icon: Building2,
    categories: [
      {
        key: 'mantenimientos',
        label: 'Mantenimientos',
        icon: Wrench,
        description: 'Parámetros administrativos',
        options: [
          { label: 'Departamentos', description: 'Estructura administrativa interna.', icon: Building2 },
          { label: 'Cargos', description: 'Catálogo de roles y puestos.', icon: Users },
          { label: 'Proveedores administrativos', description: 'Control de proveedores internos.', icon: Handshake }
        ]
      },
      {
        key: 'documentos',
        label: 'Documentos',
        icon: FileText,
        description: 'Documentos administrativos',
        options: [
          { label: 'Contratos', description: 'Gestión de contratos institucionales.', icon: ScrollText },
          { label: 'Comunicados', description: 'Documentos internos y avisos.', icon: FileText },
          { label: 'Activos administrativos', description: 'Soporte documental de activos.', icon: ClipboardList }
        ]
      },
      {
        key: 'procesos',
        label: 'Procesos',
        icon: Settings,
        description: 'Gestión administrativa',
        options: [
          { label: 'Solicitudes internas', description: 'Trámite y seguimiento de solicitudes.', icon: ClipboardCheck },
          { label: 'Control de activos', description: 'Asignación y control administrativo.', icon: Boxes },
          { label: 'Gestión legal', description: 'Procesos y seguimiento legal.', icon: Scale }
        ]
      },
      {
        key: 'informes',
        label: 'Informes',
        icon: BarChart3,
        description: 'Reportes administrativos',
        options: [
          { label: 'Inventario administrativo', description: 'Estado de activos internos.', icon: FileBarChart },
          { label: 'Solicitudes por estado', description: 'Seguimiento de trámites internos.', icon: LayoutDashboard }
        ]
      }
    ]
  },
  financiera: {
    key: 'financiera',
    title: 'Área Financiera',
    subtitle: 'Controla procesos financieros, reportes y documentación contable.',
    icon: CircleDollarSign,
    categories: [
      {
        key: 'mantenimientos',
        label: 'Mantenimientos',
        icon: Wrench,
        description: 'Parámetros financieros',
        options: [
          { label: 'Cuentas contables', description: 'Catálogo contable principal.', icon: Landmark },
          { label: 'Centros de costo', description: 'Clasificación de costos por área.', icon: FolderKanban },
          { label: 'Formas de pago', description: 'Configuración de métodos de pago.', icon: ReceiptText }
        ]
      },
      {
        key: 'documentos',
        label: 'Documentos',
        icon: FileText,
        description: 'Documentos financieros',
        options: [
          { label: 'Facturas', description: 'Consulta y control de facturación.', icon: ReceiptText },
          { label: 'Comprobantes', description: 'Soporte documental contable.', icon: FileCheck2 },
          { label: 'Retenciones', description: 'Documentos tributarios asociados.', icon: ScrollText }
        ]
      },
      {
        key: 'procesos',
        label: 'Procesos',
        icon: Settings,
        description: 'Flujos financieros',
        options: [
          { label: 'Cuentas por cobrar', description: 'Gestión de cartera y cobros.', icon: CircleDollarSign },
          { label: 'Cuentas por pagar', description: 'Control de obligaciones pendientes.', icon: ReceiptText },
          { label: 'Conciliación bancaria', description: 'Validación de movimientos bancarios.', icon: Landmark }
        ]
      },
      {
        key: 'informes',
        label: 'Informes',
        icon: BarChart3,
        description: 'Reportes financieros',
        options: [
          { label: 'Flujo de caja', description: 'Proyección y control de liquidez.', icon: LineChart },
          { label: 'Estado financiero', description: 'Resumen financiero por periodo.', icon: FileBarChart },
          { label: 'Cartera vencida', description: 'Análisis de cuentas pendientes.', icon: Gauge }
        ]
      }
    ]
  }
};

export const DEFAULT_SYSTEM_AREA_KEY: SystemAreaKey = 'sistema';

export function isSystemAreaKey(value: string | null): value is SystemAreaKey {
  return Boolean(value && value in SYSTEM_AREA_CONFIG);
}
