import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileBarChart,
  FileCheck2,
  FileText,
  Gauge,
  Handshake,
  ScrollText,
  Settings,
  Tags,
  Users,
  Wrench
} from 'lucide-angular';
import {
  RrhhAreaCategory,
  RrhhAreaConfig,
  RrhhAreaSubmoduleKey
} from '../models/rrhh-area.model';

const route = (path: string): string => `/main/modulo/rrhh/${path}`;

const createCategories = (
  submoduleLabel: string,
  maintenanceOptions: RrhhAreaCategory['options'],
  documentOptions: RrhhAreaCategory['options'] = [],
  processOptions: RrhhAreaCategory['options'] = [],
  reportOptions: RrhhAreaCategory['options'] = []
): RrhhAreaCategory[] => [
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

export const RRHH_AREA_CONFIG: RrhhAreaConfig = {
  key: 'rrhh',
  title: 'RRHH',
  subtitle: 'Gestion de personal, proveedores internos y administracion.',
  icon: Users,
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
          {
            label: 'Empleados',
            description: 'Registro de colaboradores.',
            icon: Users,
            route: route('empleado/mantenimientos/empleados')
          },
          {
            label: 'Cargos',
            description: 'Catalogo de puestos internos.',
            icon: BriefcaseBusiness,
            route: route('empleado/mantenimientos/cargos')
          },
          {
            label: 'Departamentos',
            description: 'Estructura organizacional.',
            icon: Building2,
            route: route('empleado/mantenimientos/departamentos')
          }
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
          { label: 'Asistencia por empleado', description: 'Reporte de asistencia.', icon: BarChart3 }
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
          { label: 'Servicios contratados', description: 'Servicios vinculados al personal.', icon: Tags }
        ],
        [
          { label: 'Contratos de servicio', description: 'Documentos de proveedores.', icon: FileCheck2 }
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
          { label: 'Calendarios', description: 'Calendarios laborales y eventos.', icon: ClipboardCheck },
          { label: 'Beneficios', description: 'Beneficios disponibles.', icon: Tags }
        ],
        [
          { label: 'Politicas internas', description: 'Normas y documentos de RRHH.', icon: ScrollText }
        ],
        [
          { label: 'Aprobaciones', description: 'Flujos de aprobacion interna.', icon: ClipboardCheck }
        ],
        [
          { label: 'Indicadores RRHH', description: 'Metricas de gestion humana.', icon: BarChart3 }
        ]
      )
    }
  ]
};

export const DEFAULT_RRHH_SUBMODULE_KEY: RrhhAreaSubmoduleKey = 'empleado';

export function isRrhhAreaSubmoduleKey(value: string | null): value is RrhhAreaSubmoduleKey {
  return Boolean(
    value &&
      RRHH_AREA_CONFIG.submodules.some((submodule) => submodule.key === value)
  );
}
