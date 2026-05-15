import {
  BarChart3,
  CircleDollarSign,
  Code2,
  ClipboardCheck,
  FileBarChart,
  FileCheck2,
  FileText,
  FolderKanban,
  Gauge,
  HandCoins,
  Package,
  Scale,
  ScrollText,
  Settings,
  Tags,
  UserRoundCheck,
  Users,
  Wrench
} from 'lucide-angular';
import {
  ClientsAreaCategory,
  ClientsAreaConfig,
  ClientsAreaSubmoduleKey
} from '../models/clients-area.model';

const route = (path: string): string => `/main/modulo/clientes/${path}`;

const createCategories = (
  submoduleLabel: string,
  maintenanceOptions: ClientsAreaCategory['options'],
  documentOptions: ClientsAreaCategory['options'] = [],
  processOptions: ClientsAreaCategory['options'] = [],
  reportOptions: ClientsAreaCategory['options'] = []
): ClientsAreaCategory[] => [
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

export const CLIENTS_AREA_CONFIG: ClientsAreaConfig = {
  key: 'clientes',
  title: 'Clientes',
  subtitle: 'Gestion comercial de clientes, vendedores y procesos asociados.',
  icon: Users,
  defaultSubmoduleKey: 'comercial',
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
          { label: 'Conversion por campana', description: 'Indicadores de marketing.', icon: BarChart3 }
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
    },
    {
      key: 'comercial',
      label: 'Comercial',
      description: 'Gestion comercial, vendedores y seguimiento de clientes.',
      icon: HandCoins,
      categories: createCategories(
        'Comercial',
        [
          {
            label: 'Vendedor',
            description: 'Registro y administracion de vendedores.',
            icon: UserRoundCheck,
            route: route('comercial/mantenimientos/vendedores')
          }
        ],
        [
          { label: 'Contratos comerciales', description: 'Documentos comerciales de clientes.', icon: ScrollText },
          { label: 'Soportes de venta', description: 'Archivos y respaldos comerciales.', icon: FileCheck2 }
        ],
        [
          { label: 'Gestion comercial', description: 'Seguimiento de oportunidades y actividades.', icon: ClipboardCheck }
        ],
        [
          { label: 'Vendedores activos', description: 'Consulta de vendedores por estado.', icon: FileBarChart },
          { label: 'Actividad comercial', description: 'Indicadores de gestion comercial.', icon: BarChart3 }
        ]
      )
    }
  ]
};

export const DEFAULT_CLIENTS_SUBMODULE_KEY: ClientsAreaSubmoduleKey = 'comercial';

export function isClientsAreaSubmoduleKey(value: string | null): value is ClientsAreaSubmoduleKey {
  return Boolean(
    value &&
      CLIENTS_AREA_CONFIG.submodules.some((submodule) => submodule.key === value)
  );
}
