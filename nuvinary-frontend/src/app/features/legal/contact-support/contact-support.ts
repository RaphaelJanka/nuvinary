import { Component, inject, signal } from '@angular/core';
import { email, form, required, FormField } from '@angular/forms/signals';
import { ContactSupportData } from './contact-support-data.model';
import { LegalService } from '../../services/legal-service';

@Component({
  selector: 'app-contact-support',
  imports: [FormField],
  templateUrl: './contact-support.html',
})
export class ContactSupport {
  private readonly legalService = inject(LegalService);
  private readonly supportModel = signal<ContactSupportData>({
    name: '',
    email: '',
    message: '',
  });

  protected readonly supportForm = form(this.supportModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    required(schema.email, { message: 'Email is required' });
    required(schema.message, { message: 'Message is required' });
    email(schema.email, { message: 'Please enter a valid email address' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.supportForm().valid()) {
      this.legalService.sendContactMessage(this.supportModel());
      this.supportModel.set({
        name: '',
        email: '',
        message: '',
      });
    }
  }
}
