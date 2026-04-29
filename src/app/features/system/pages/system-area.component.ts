import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services/navigation.service';

type SectionKey = 'mantenimientos' | 'documentos' | 'procesos' | 'informes';

interface SectionButton {
  key: SectionKey;
  label: string;
  icon: string;
  description: string;
}

interface SystemOption {
  label: string;
  description: string;
  icon: string;
  route?: 'helpdesk';
}

@Component({
  selector: 'app-system-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-area.component.html',
  styleUrl: './system-area.component.scss'
})
export class SystemAreaComponent {
  activeSection: SectionKey = 'mantenimientos';

  readonly sections: SectionButton[] = [
    {
      key: 'mantenimientos',
      label: 'Mantenimientos',
      icon: '🛠️',
      description: 'Catálogos y parámetros del sistema'
    },
    {
      key: 'documentos',
      label: 'Documentos',
      icon: '📄',
      description: 'Gestión documental interna'
    },
    {
      key: 'procesos',
      label: 'Procesos',
      icon: '⚙️',
      description: 'Flujos operativos del sistema'
    },
    {
      key: 'informes',
      label: 'Informes',
      icon: '📊',
      description: 'Reportes y consultas'
    }
  ];

  readonly data: Record<SectionKey, SystemOption[]> = {
    mantenimientos: [
      { label: 'Empresas', description: 'Administración de empresas registradas.', icon: '🏢' },
      { label: 'Entidades', description: 'Gestión de entidades relacionadas.', icon: '🏛️' },
      { label: 'Proveedores', description: 'Registro y control de proveedores.', icon: '🤝' },
      { label: 'Ubicaciones', description: 'Configuración de ubicaciones físicas.', icon: '📍' },
      { label: 'Tipos de equipos', description: 'Clasificación de equipos.', icon: '🖥️' },
      { label: 'Grupos', description: 'Agrupación de elementos del sistema.', icon: '🗂️' },
      { label: 'Marcas', description: 'Mantenimiento de marcas.', icon: '🏷️' },
      { label: 'Modelos', description: 'Mantenimiento de modelos.', icon: '📦' },
      { label: 'Segmentación', description: 'Definición de segmentos internos.', icon: '🧩' },
      { label: 'Permisos de antivirus', description: 'Control de permisos relacionados a antivirus.', icon: '🛡️' },
      { label: 'Permisos de internet', description: 'Control de accesos a internet.', icon: '🌐' },
      { label: 'Software', description: 'Registro de software disponible.', icon: '💿' },
      { label: 'Categoría', description: 'Clasificación por categorías.', icon: '📌' },
      { label: 'Problemas', description: 'Catálogo de problemas frecuentes.', icon: '⚠️' },
      { label: 'Opciones', description: 'Parámetros generales del sistema.', icon: '🔧' }
    ],

    documentos: [
      { label: 'Documentos generales', description: 'Consulta de documentos internos.', icon: '📄' },
      { label: 'Solicitudes', description: 'Gestión de solicitudes documentales.', icon: '📝' },
      { label: 'Formatos internos', description: 'Plantillas y formatos institucionales.', icon: '📑' },
      { label: 'Actas', description: 'Registro y consulta de actas.', icon: '📚' }
    ],

    procesos: [
      { label: 'Bitácora de asistencia', description: 'Registro de asistencias del personal.', icon: '🕒' },
      { label: 'Control de datos por usuario', description: 'Control de información asociada a usuarios.', icon: '👤' },
      { label: 'Ingreso de componentes', description: 'Registro de componentes nuevos.', icon: '➕' },
      { label: 'Mantenimiento de componentes', description: 'Gestión y actualización de componentes.', icon: '🔩' },
      { label: 'Validación de ingreso de componentes', description: 'Revisión y validación de componentes ingresados.', icon: '✅' },
      { label: 'Entrega y ajuste de equipos', description: 'Control de entrega y ajustes técnicos.', icon: '📦' },
      { label: 'Mantenimiento de equipos', description: 'Seguimiento de mantenimiento técnico.', icon: '🧰' },
      {
        label: 'HelpDesk',
        description: 'Registro y seguimiento de tickets de soporte.',
        icon: '💻',
        route: 'helpdesk'
      }
    ],

    informes: [
      { label: 'Historial de equipos', description: 'Consulta histórica de equipos.', icon: '🗃️' },
      { label: 'TOP de asistencias soporte', description: 'Ranking de asistencias realizadas.', icon: '🏆' },
      { label: 'Informe Tickets', description: 'Reporte general de tickets.', icon: '🎫' },
      { label: 'Informe de Horas', description: 'Reporte de horas registradas.', icon: '⏱️' }
    ]
  };

  constructor(private readonly navigationService: NavigationService) {}

  selectSection(section: SectionKey): void {
    this.activeSection = section;
  }

  async selectOption(option: SystemOption): Promise<void> {
    if (option.route === 'helpdesk') {
      await this.navigationService.goToHelpdesk();
      return;
    }

    console.log(`Seleccionado: ${option.label}`);
  }

  get activeTitle(): string {
    return this.sections.find((section) => section.key === this.activeSection)?.label ?? '';
  }

  get activeDescription(): string {
    return this.sections.find((section) => section.key === this.activeSection)?.description ?? '';
  }
}