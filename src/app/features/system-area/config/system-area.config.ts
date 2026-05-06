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
  SystemAreaKey,
  SystemAreaSubmoduleKey
} from '../models/system-area.model';

const systemCategories: SystemAreaCategory[] = [
  {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    icon: Wrench,
    description: 'Catálogos y parámetros del sistema',
    options: [
      {
        label: 'Empresas',
        description: 'Administración de empresas registradas.',
        icon: Building2,
        route: '/main/area/sistema/help-desk/mantenimientos/empresas'
      },
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

const createSystemSubmoduleCategories = (
  submoduleLabel: string,
  maintenanceOptions: SystemAreaCategory['options'],
  documentOptions: SystemAreaCategory['options'],
  processOptions: SystemAreaCategory['options'],
  reportOptions: SystemAreaCategory['options']
): SystemAreaCategory[] => [
  {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    icon: Wrench,
    description: `Catalogos y parametros de ${submoduleLabel}`,
    options: maintenanceOptions
  },
  {
    key: 'documentos',
    label: 'Documentos',
    icon: FileText,
    description: `Documentos propios de ${submoduleLabel}`,
    options: documentOptions
  },
  {
    key: 'procesos',
    label: 'Procesos',
    icon: Settings,
    description: `Procesos operativos de ${submoduleLabel}`,
    options: processOptions
  },
  {
    key: 'informes',
    label: 'Informes',
    icon: BarChart3,
    description: `Informes y consultas de ${submoduleLabel}`,
    options: reportOptions
  }
];

const systemDevelopmentCategories = createSystemSubmoduleCategories(
  'Desarrollo',
  [
    { label: 'Ambientes', description: 'Configuracion de entornos de trabajo.', icon: MonitorCog },
    { label: 'Versiones', description: 'Control de versiones liberadas.', icon: Tags },
    { label: 'Repositorios', description: 'Registro de repositorios tecnicos.', icon: Database }
  ],
  [
    { label: 'Especificaciones', description: 'Documentacion funcional y tecnica.', icon: FileText },
    { label: 'Actas de cambios', description: 'Soporte documental de cambios.', icon: FileCheck2 }
  ],
  [
    { label: 'Control de cambios', description: 'Seguimiento de cambios del sistema.', icon: ClipboardCheck },
    { label: 'Validacion QA', description: 'Revision y validacion de entregables.', icon: ShieldCheck }
  ],
  [
    { label: 'Cambios por periodo', description: 'Resumen de cambios por fechas.', icon: FileBarChart },
    { label: 'Estado de versiones', description: 'Consulta de versiones activas.', icon: ChartColumn }
  ]
);

const systemGeneralCategories = createSystemSubmoduleCategories(
  'Generales',
  [
    { label: 'Empresas generales', description: 'Parametros generales de empresas.', icon: Building2 },
    { label: 'Ubicaciones generales', description: 'Ubicaciones de uso transversal.', icon: MapPin },
    { label: 'Opciones generales', description: 'Configuracion general del sistema.', icon: Settings }
  ],
  [
    { label: 'Documentos generales', description: 'Consulta de documentos compartidos.', icon: FileText },
    { label: 'Formatos internos', description: 'Plantillas institucionales.', icon: ScrollText }
  ],
  [
    { label: 'Procesos generales', description: 'Flujos generales del sistema.', icon: LayoutDashboard },
    { label: 'Aprobaciones generales', description: 'Aprobaciones comunes entre areas.', icon: ClipboardCheck }
  ],
  [
    { label: 'Resumen general', description: 'Reporte transversal del sistema.', icon: FileBarChart },
    { label: 'Indicadores generales', description: 'Metricas principales del sistema.', icon: Gauge }
  ]
);

const systemCorrectionCategories = createSystemSubmoduleCategories(
  'Correccion de datos',
  [
    { label: 'Reglas de correccion', description: 'Parametros para depuracion de datos.', icon: Settings },
    { label: 'Campos auditables', description: 'Campos sujetos a revision.', icon: Database }
  ],
  [
    { label: 'Solicitudes de correccion', description: 'Documentos de solicitud de cambios.', icon: ClipboardList },
    { label: 'Evidencias', description: 'Soportes de ajustes realizados.', icon: FileCheck2 }
  ],
  [
    { label: 'Validacion de datos', description: 'Revision de datos corregidos.', icon: ClipboardCheck },
    { label: 'Ajustes masivos', description: 'Proceso de ajuste de informacion.', icon: Wrench }
  ],
  [
    { label: 'Historial de correcciones', description: 'Consulta historica de ajustes.', icon: FileBarChart },
    { label: 'Errores frecuentes', description: 'Resumen de incidencias de datos.', icon: ChartColumn }
  ]
);

const systemSecurityCategories = createSystemSubmoduleCategories(
  'Seguridad',
  [
    { label: 'Usuarios', description: 'Administracion de usuarios del sistema.', icon: Users },
    { label: 'Roles', description: 'Configuracion de roles y permisos.', icon: ShieldCheck },
    { label: 'Permisos', description: 'Asignacion de accesos por modulo.', icon: MonitorCog }
  ],
  [
    { label: 'Politicas de seguridad', description: 'Documentos normativos de seguridad.', icon: ScrollText },
    { label: 'Actas de accesos', description: 'Soporte de cambios de permisos.', icon: FileCheck2 }
  ],
  [
    { label: 'Revision de accesos', description: 'Validacion periodica de permisos.', icon: ClipboardCheck },
    { label: 'Auditoria de sesiones', description: 'Seguimiento de actividad de usuarios.', icon: ShieldCheck }
  ],
  [
    { label: 'Accesos por usuario', description: 'Reporte de permisos asignados.', icon: FileBarChart },
    { label: 'Actividad de seguridad', description: 'Indicadores de eventos de seguridad.', icon: ChartColumn }
  ]
);

export const SYSTEM_AREA_CONFIG: Record<SystemAreaKey, SystemAreaConfig> = {
  sistema: {
    key: 'sistema',
    title: 'Área del Sistema',
    subtitle: 'Selecciona una categoría para visualizar sus opciones disponibles.',
    icon: MonitorCog,
    categories: systemCategories,
    defaultSubmoduleKey: 'help-desk',
    submodules: [
      {
        key: 'desarrollo',
        label: 'Desarrollo',
        description: 'Gestion tecnica de cambios, versiones y validaciones.',
        icon: MonitorCog,
        categories: systemDevelopmentCategories
      },
      {
        key: 'generales',
        label: 'Generales',
        description: 'Parametros y procesos generales del sistema.',
        icon: Settings,
        categories: systemGeneralCategories
      },
      {
        key: 'correccion-datos',
        label: 'Correccion de datos',
        description: 'Control de solicitudes, validaciones y ajustes de informacion.',
        icon: Database,
        categories: systemCorrectionCategories
      },
      {
        key: 'help-desk',
        label: 'Help Desk',
        description: 'Soporte, equipos, componentes y tickets de asistencia.',
        icon: TicketCheck,
        categories: systemCategories
      },
      {
        key: 'seguridad',
        label: 'Seguridad',
        description: 'Usuarios, roles, permisos y auditoria de accesos.',
        icon: ShieldCheck,
        categories: systemSecurityCategories
      }
    ]
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
export const DEFAULT_SYSTEM_SUBMODULE_KEY: SystemAreaSubmoduleKey = 'help-desk';

export function isSystemAreaKey(value: string | null): value is SystemAreaKey {
  return Boolean(value && value in SYSTEM_AREA_CONFIG);
}

export function isSystemAreaSubmoduleKey(
  areaKey: SystemAreaKey,
  value: string | null
): value is SystemAreaSubmoduleKey {
  return Boolean(
    value &&
      SYSTEM_AREA_CONFIG[areaKey].submodules?.some((submodule) => submodule.key === value)
  );
}
