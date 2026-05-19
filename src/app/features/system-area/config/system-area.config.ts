import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChartColumn,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Code2,
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

const route = (path: string): string => `/main/modulo/${path}`;

const createCategories = (
  submoduleLabel: string,
  maintenanceOptions: SystemAreaCategory['options'],
  documentOptions: SystemAreaCategory['options'] = [],
  processOptions: SystemAreaCategory['options'] = [],
  reportOptions: SystemAreaCategory['options'] = []
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
    description: `Documentos de ${submoduleLabel}`,
    options: documentOptions
  },
  {
    key: 'procesos',
    label: 'Procesos',
    icon: Settings,
    description: `Procesos de ${submoduleLabel}`,
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

const configuracionCategories = createCategories(
  'Configuracion',
  [
    {
      label: 'Empresas',
      description: 'Administracion de empresas registradas.',
      icon: Building2,
      route: route('sistema/configuracion/mantenimientos/empresas')
    },
    {
      label: 'Ubicacion',
      description: 'Configuracion de ubicaciones fisicas.',
      icon: MapPin,
      route: route('sistema/configuracion/mantenimientos/ubicaciones')
    },
    {
      label: 'Sucursal',
      description: 'Gestion de sucursales registradas.',
      icon: Landmark,
      route: route('sistema/configuracion/sucursales')
    },
    {
      label: 'Modulos',
      description: 'Configuracion de modulos del sistema.',
      icon: LayoutDashboard,
      route: route('sistema/configuracion/modulos')
    },
    {
      label: 'Opciones',
      description: 'Opciones disponibles por modulo.',
      icon: Settings,
      route: route('sistema/configuracion/opciones')
    },
    {
      label: 'Tipo de opciones',
      description: 'Clasificacion de opciones del sistema.',
      icon: Tags,
      route: route('sistema/configuracion/tipo-opciones')
    },
    {
      label: 'User',
      description: 'Administracion de usuarios del sistema.',
      icon: Users,
      route: route('sistema/configuracion/user')
    },
    {
      label: 'Acciones',
      description: 'Permisos y acciones disponibles.',
      icon: ClipboardCheck,
      route: route('sistema/configuracion/acciones')
    },
    {
      label: 'Area',
      description: 'Grupos organizacionales internos.',
      icon: FolderKanban,
      route: route('sistema/configuracion/mantenimientos/areas')
    },
    { label: 'Preferencia', description: 'Preferencias generales de operacion.', icon: Gauge }
  ],
  [
    { label: 'Parametros generales', description: 'Documentos de referencia de configuracion.', icon: FileText },
    { label: 'Actas de cambios', description: 'Soporte documental de ajustes realizados.', icon: FileCheck2 }
  ],
  [
    {
      label: 'Gestor de permisos',
      description: 'Asignacion visual de permisos por usuario.',
      icon: ShieldCheck,
      route: route('sistema/configuracion/procesos/gestor-permisos')
    },
    { label: 'Auditoria de cambios', description: 'Revision de cambios aplicados.', icon: ShieldCheck },
    { label: 'Validacion de parametros', description: 'Control de consistencia de configuraciones.', icon: ClipboardCheck }
  ],
  [
    { label: 'Resumen de configuracion', description: 'Consulta de parametros principales.', icon: FileBarChart },
    { label: 'Cambios por periodo', description: 'Reporte de ajustes por fecha.', icon: ChartColumn }
  ]
);

const helpDeskCategories = createCategories(
  'Helpdesk',
  [
    { label: 'Categoria', description: 'Clasificacion de solicitudes de soporte.', icon: ClipboardList },
    { label: 'Problemas', description: 'Catalogo de problemas frecuentes.', icon: TicketCheck },
    {
      label: 'Helpdesk',
      description: 'Parametros de atencion y soporte.',
      icon: MonitorCog,
      route: route('sistema/help-desk/mantenimientos/helpdesk')
    },
    { label: 'Device', description: 'Registro y control de equipos.', icon: HardDrive },
    { label: 'Componente', description: 'Registro y control de componentes.', icon: Package }
  ],
  [
    { label: 'Solicitudes', description: 'Documentos asociados a atencion de soporte.', icon: FileText },
    { label: 'Evidencias', description: 'Archivos y soportes de los casos.', icon: FileCheck2 }
  ],
  [
    {
      label: 'Tickets',
      description: 'Registro y seguimiento de tickets de mantenimiento.',
      icon: TicketCheck,
      route: '/main/tickets'
    },
    { label: 'Entrega y ajuste de equipos', description: 'Control de entrega y cambios tecnicos.', icon: Truck },
    { label: 'Mantenimiento de componentes', description: 'Gestion y actualizacion de componentes.', icon: Wrench }
  ],
  [
    { label: 'Informe Tickets', description: 'Reporte general de tickets.', icon: TicketCheck },
    { label: 'Historial de equipos', description: 'Consulta historica de equipos.', icon: FileBarChart },
    { label: 'TOP de asistencias soporte', description: 'Ranking de asistencias realizadas.', icon: ChartColumn }
  ]
);

export const SYSTEM_AREA_CONFIG: Record<SystemAreaKey, SystemAreaConfig> = {
  finanzas: {
    key: 'finanzas',
    title: 'Finanzas',
    subtitle: 'Gestion financiera, contable y de tesoreria.',
    icon: CircleDollarSign,
    categories: [],
    defaultSubmoduleKey: 'contable-sri',
    submodules: [
      {
        key: 'contable-sri',
        label: 'Contable y SRI',
        description: 'Control contable, tributario y documentos fiscales.',
        icon: Landmark,
        categories: createCategories(
          'Contable y SRI',
          [
            { label: 'Cuentas contables', description: 'Catalogo contable principal.', icon: Landmark },
            { label: 'Centros de costo', description: 'Clasificacion de costos internos.', icon: FolderKanban },
            { label: 'Retenciones', description: 'Parametros tributarios y retenciones.', icon: ReceiptText }
          ],
          [
            { label: 'Facturas', description: 'Consulta y control de facturacion.', icon: ReceiptText },
            { label: 'Comprobantes', description: 'Soporte documental contable.', icon: FileCheck2 }
          ],
          [
            { label: 'Cierre contable', description: 'Proceso de cierre por periodo.', icon: ClipboardCheck },
            { label: 'Conciliacion tributaria', description: 'Validacion de datos fiscales.', icon: Scale }
          ],
          [
            { label: 'Estado financiero', description: 'Resumen financiero por periodo.', icon: FileBarChart },
            { label: 'Indicadores contables', description: 'Metricas principales contables.', icon: ChartColumn }
          ]
        )
      },
      {
        key: 'caja-tesoreria',
        label: 'Caja y Tesoreria',
        description: 'Control de caja, bancos, pagos y cobros.',
        icon: CircleDollarSign,
        categories: createCategories(
          'Caja y Tesoreria',
          [
            { label: 'Cajas', description: 'Configuracion de cajas disponibles.', icon: CircleDollarSign },
            { label: 'Bancos', description: 'Registro de bancos y cuentas.', icon: Landmark },
            { label: 'Formas de pago', description: 'Metodos de pago permitidos.', icon: ReceiptText }
          ],
          [
            { label: 'Recibos', description: 'Documentos de cobro y pago.', icon: FileText },
            { label: 'Comprobantes bancarios', description: 'Soportes de movimientos bancarios.', icon: FileCheck2 }
          ],
          [
            { label: 'Cuentas por cobrar', description: 'Gestion de cartera y cobros.', icon: CircleDollarSign },
            { label: 'Cuentas por pagar', description: 'Control de obligaciones pendientes.', icon: ReceiptText },
            { label: 'Conciliacion bancaria', description: 'Validacion de movimientos bancarios.', icon: Landmark }
          ],
          [
            { label: 'Flujo de caja', description: 'Proyeccion y control de liquidez.', icon: LineChart },
            { label: 'Cartera vencida', description: 'Analisis de cuentas pendientes.', icon: Gauge }
          ]
        )
      }
    ]
  },
  rrhh: {
    key: 'rrhh',
    title: 'RRHH',
    subtitle: 'Gestion de personal, proveedores internos y administracion.',
    icon: Users,
    categories: [],
    defaultSubmoduleKey: 'empleado',
    submodules: [
      {
        key: 'empleado',
        label: 'Empleado',
        description: 'Informacion laboral, cargos y seguimiento de personal.',
        icon: Users,
        categories: createCategories(
          'Empleado',
          [
            { label: 'Empleados', description: 'Registro de colaboradores.', icon: Users },
            { label: 'Cargos', description: 'Catalogo de puestos internos.', icon: BriefcaseBusiness },
            { label: 'Departamentos', description: 'Estructura organizacional.', icon: Building2 }
          ],
          [
            { label: 'Contratos', description: 'Documentos laborales.', icon: ScrollText },
            { label: 'Comunicados', description: 'Avisos internos para colaboradores.', icon: FileText }
          ],
          [
            { label: 'Solicitudes internas', description: 'Tramites del personal.', icon: ClipboardCheck },
            { label: 'Revision de asistencia', description: 'Control de asistencia.', icon: Gauge }
          ],
          [
            { label: 'Nomina por periodo', description: 'Resumen de nomina.', icon: FileBarChart },
            { label: 'Asistencia por empleado', description: 'Reporte de asistencia.', icon: ChartColumn }
          ]
        )
      },
      {
        key: 'proveedores',
        label: 'Proveedores',
        description: 'Gestion de proveedores relacionados con RRHH.',
        icon: Handshake,
        categories: createCategories(
          'Proveedores',
          [
            { label: 'Proveedores', description: 'Registro de proveedores.', icon: Handshake },
            { label: 'Servicios contratados', description: 'Servicios vinculados al personal.', icon: ClipboardList }
          ],
          [
            { label: 'Contratos de servicio', description: 'Documentos de proveedores.', icon: ScrollText }
          ],
          [
            { label: 'Evaluacion de proveedores', description: 'Revision de desempeno.', icon: ClipboardCheck }
          ],
          [
            { label: 'Proveedores activos', description: 'Consulta de proveedores vigentes.', icon: FileBarChart }
          ]
        )
      },
      {
        key: 'administracion',
        label: 'Administracion',
        description: 'Procesos administrativos de recursos humanos.',
        icon: Building2,
        categories: createCategories(
          'Administracion',
          [
            { label: 'Calendarios', description: 'Calendarios laborales y eventos.', icon: ClipboardList },
            { label: 'Beneficios', description: 'Beneficios disponibles.', icon: Tags }
          ],
          [
            { label: 'Politicas internas', description: 'Normas y documentos de RRHH.', icon: ScrollText }
          ],
          [
            { label: 'Aprobaciones', description: 'Flujos de aprobacion interna.', icon: ClipboardCheck }
          ],
          [
            { label: 'Indicadores RRHH', description: 'Metricas de gestion humana.', icon: ChartColumn }
          ]
        )
      }
    ]
  },
  clientes: {
    key: 'clientes',
    title: 'Clientes',
    subtitle: 'Gestion comercial, cobranza, codigos y procesos legales.',
    icon: Users,
    categories: [],
    defaultSubmoduleKey: 'marketing',
    submodules: [
      {
        key: 'marketing',
        label: 'Marketing',
        description: 'Campanas, segmentacion y material promocional.',
        icon: Gauge,
        categories: createCategories(
          'Marketing',
          [
            { label: 'Campanas', description: 'Registro de campanas comerciales.', icon: Gauge },
            { label: 'Segmentacion', description: 'Clasificacion de clientes.', icon: FolderKanban },
            { label: 'Material promocional', description: 'Recursos para promociones.', icon: Package }
          ],
          [
            { label: 'Piezas comerciales', description: 'Documentos de campanas.', icon: FileText }
          ],
          [
            { label: 'Lanzamiento de campana', description: 'Flujo de publicacion.', icon: ClipboardCheck }
          ],
          [
            { label: 'Conversion por campana', description: 'Indicadores de marketing.', icon: ChartColumn }
          ]
        )
      },
      {
        key: 'cobranza',
        label: 'Cobranza',
        description: 'Seguimiento de cartera y compromisos de pago.',
        icon: CircleDollarSign,
        categories: createCategories(
          'Cobranza',
          [
            { label: 'Estados de cartera', description: 'Clasificacion de cartera.', icon: Tags },
            { label: 'Gestores', description: 'Responsables de cobranza.', icon: Users }
          ],
          [
            { label: 'Compromisos de pago', description: 'Documentos de acuerdos.', icon: FileCheck2 }
          ],
          [
            { label: 'Gestion de cobranza', description: 'Seguimiento de cobros.', icon: ClipboardCheck }
          ],
          [
            { label: 'Cartera vencida', description: 'Reporte de vencimientos.', icon: Gauge }
          ]
        )
      },
      {
        key: 'codigo-imp',
        label: 'Codigo IMP',
        description: 'Control y seguimiento de codigos IMP.',
        icon: Code2,
        categories: createCategories(
          'Codigo IMP',
          [
            { label: 'Codigos IMP', description: 'Catalogo de codigos IMP.', icon: Code2 },
            { label: 'Tipos de codigo', description: 'Clasificacion de codigos.', icon: Tags }
          ],
          [
            { label: 'Documentos IMP', description: 'Soporte documental asociado.', icon: FileText }
          ],
          [
            { label: 'Validacion IMP', description: 'Revision de codigos registrados.', icon: ClipboardCheck }
          ],
          [
            { label: 'Uso de codigos', description: 'Consulta de movimiento por codigo.', icon: FileBarChart }
          ]
        )
      },
      {
        key: 'legal',
        label: 'Legal',
        description: 'Gestion documental y procesos legales de clientes.',
        icon: Scale,
        categories: createCategories(
          'Legal',
          [
            { label: 'Tipos de caso', description: 'Clasificacion legal de casos.', icon: Tags },
            { label: 'Abogados', description: 'Responsables legales.', icon: Users }
          ],
          [
            { label: 'Contratos', description: 'Documentos legales.', icon: ScrollText },
            { label: 'Actas', description: 'Actas y soportes legales.', icon: FileCheck2 }
          ],
          [
            { label: 'Seguimiento legal', description: 'Control de casos legales.', icon: ClipboardCheck }
          ],
          [
            { label: 'Casos por estado', description: 'Reporte de casos legales.', icon: FileBarChart }
          ]
        )
      }
    ]
  },
  producto: {
    key: 'producto',
    title: 'Producto',
    subtitle: 'Control de produccion, distribucion, compras e importaciones.',
    icon: Package,
    categories: [],
    defaultSubmoduleKey: 'produccion-distribucion',
    submodules: [
      {
        key: 'produccion-distribucion',
        label: 'Produccion y Distribucion',
        description: 'Seguimiento de produccion, inventario y distribucion.',
        icon: Factory,
        categories: createCategories(
          'Produccion y Distribucion',
          [
            {
              label: 'Productos',
              description: 'Catalogo de productos.',
              icon: Package,
              route: route('producto/produccion-distribucion/productos')
            },
            { label: 'Bodegas', description: 'Ubicaciones logisticas y almacenes.', icon: Boxes },
            { label: 'Rutas de distribucion', description: 'Rutas y cobertura logistica.', icon: Truck }
          ],
          [
            { label: 'Ordenes de produccion', description: 'Documentos de produccion.', icon: ClipboardList },
            { label: 'Guias de despacho', description: 'Soportes de entrega.', icon: Truck }
          ],
          [
            { label: 'Produccion', description: 'Flujo productivo.', icon: Factory },
            { label: 'Distribucion', description: 'Proceso de despacho y entrega.', icon: Truck }
          ],
          [
            { label: 'Rotacion de inventario', description: 'Analisis de movimiento de stock.', icon: Boxes },
            { label: 'Entregas por periodo', description: 'Indicadores de distribucion.', icon: ChartColumn }
          ]
        )
      },
      {
        key: 'compras-importaciones',
        label: 'Compras e Importaciones',
        description: 'Gestion de compras, proveedores e importaciones.',
        icon: ReceiptText,
        categories: createCategories(
          'Compras e Importaciones',
          [
            { label: 'Proveedores', description: 'Registro y control de proveedores.', icon: Handshake },
            { label: 'Tipos de compra', description: 'Clasificacion de compras.', icon: Tags },
            { label: 'Paises de origen', description: 'Origenes de importacion.', icon: MapPin }
          ],
          [
            { label: 'Ordenes de compra', description: 'Documentos de adquisicion.', icon: ReceiptText },
            { label: 'Documentos de importacion', description: 'Soportes de importacion.', icon: FileText }
          ],
          [
            { label: 'Compras', description: 'Control de solicitudes y adquisiciones.', icon: ReceiptText },
            { label: 'Importaciones', description: 'Seguimiento de importaciones.', icon: Truck }
          ],
          [
            { label: 'Compras por proveedor', description: 'Resumen por proveedor.', icon: FileBarChart },
            { label: 'Importaciones por estado', description: 'Seguimiento de estados.', icon: ChartColumn }
          ]
        )
      }
    ]
  },
  analisis: {
    key: 'analisis',
    title: 'Analisis',
    subtitle: 'Indicadores, reportes y seguimiento analitico.',
    icon: ChartColumn,
    categories: [],
    defaultSubmoduleKey: 'am-r',
    submodules: [
      {
        key: 'am-r',
        label: 'AM y R',
        description: 'Analisis, medicion y reportes ejecutivos.',
        icon: BarChart3,
        categories: createCategories(
          'AM y R',
          [
            { label: 'Indicadores KPI', description: 'Configuracion de indicadores clave.', icon: LineChart },
            { label: 'Metas', description: 'Definicion de objetivos por periodo.', icon: Gauge }
          ],
          [
            { label: 'Tableros', description: 'Documentacion de tableros e indicadores.', icon: FileText }
          ],
          [
            { label: 'Seguimiento estrategico', description: 'Control de iniciativas prioritarias.', icon: LayoutDashboard },
            { label: 'Revision de metricas', description: 'Validacion periodica de indicadores.', icon: ClipboardCheck }
          ],
          [
            { label: 'Dashboard ejecutivo', description: 'Resumen de indicadores principales.', icon: ChartColumn },
            { label: 'Cumplimiento de metas', description: 'Avance de objetivos.', icon: FileBarChart }
          ]
        )
      }
    ]
  },
  sistema: {
    key: 'sistema',
    title: 'Sistema',
    subtitle: 'Configuracion, soporte y herramientas tecnicas.',
    icon: MonitorCog,
    categories: [],
    defaultSubmoduleKey: 'configuracion',
    submodules: [
      {
        key: 'configuracion',
        label: 'Configuracion',
        description: 'Catalogos base, preferencias y parametros del sistema.',
        icon: Settings,
        categories: configuracionCategories
      },
      {
        key: 'help-desk',
        label: 'Helpdesk',
        description: 'Soporte, tickets, equipos y componentes.',
        icon: TicketCheck,
        categories: helpDeskCategories
      },
      {
        key: 'developer',
        label: 'Developer',
        description: 'Herramientas tecnicas para desarrollo y mantenimiento.',
        icon: Code2,
        categories: createCategories(
          'Developer',
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
        )
      }
    ]
  }
};

export const DEFAULT_SYSTEM_AREA_KEY: SystemAreaKey = 'sistema';
export const DEFAULT_SYSTEM_SUBMODULE_KEY: SystemAreaSubmoduleKey = 'configuracion';

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
