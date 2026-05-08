import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Inbox, LucideAngularModule, Mail, Send } from 'lucide-angular';

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.scss'
})
export class MailComponent {
  readonly inboxIcon = Inbox;
  readonly mailIcon = Mail;
  readonly sendIcon = Send;

  readonly messages = [
    {
      title: 'Bandeja preparada',
      detail: 'Esta vista queda lista para conectar el modulo de correo.',
      time: 'Hoy'
    },
    {
      title: 'Notificaciones internas',
      detail: 'Aqui podran mostrarse mensajes del sistema ABS.',
      time: 'Pendiente'
    }
  ];
}
