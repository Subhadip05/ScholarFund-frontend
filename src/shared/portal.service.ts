import { inject, Injectable, signal } from '@angular/core';
import {
  ModalType,
  UserRole
} from './types';
import { Authservice } from './auth/authservice';
import Notiflix from 'notiflix';
@Injectable({
  providedIn: 'root',
})
export class PortalService {
  private authservice = inject(Authservice);

  isScrolled = false;
  mobileMenuOpen = false;
  activeModal = signal<ModalType>(null);

  userRole: UserRole = null;
  userMetadata: any = null;

  constructor() {
    this.userRole = sessionStorage.getItem('user_role') as UserRole;
    const savedMetadata = sessionStorage.getItem('user_metadata');

    if (savedMetadata) {
      try {
        this.userMetadata = JSON.parse(savedMetadata);
      } catch (e) {
        console.error('Error parsing user metadata from sessionStorage', e);
      }
    }
  }

  openModal(type: ModalType) {
    console.log('Open modal type: ', type);
    this.activeModal.set(type);
    this.mobileMenuOpen = false;
  }

  closeModal() {
    console.log('close modal : ', this.activeModal());
    this.activeModal.set(null);
  }

  // Log out current session
  logout() {
    Notiflix.Loading.pulse('Loading...', {});
    this.authservice.logout();
    this.userRole = null;
    this.userMetadata = null;
    Notiflix.Loading.remove();
  }

  // Helper scroll
  scrollToSection(id: string) {
    this.mobileMenuOpen = false;
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }
}
