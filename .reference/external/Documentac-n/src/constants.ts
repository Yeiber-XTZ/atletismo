import { Document, Category } from './types';

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Estatutos Liga de Atletismo 2024',
    description: 'Official framework governing all regional athletic competitions and club affiliations for the current cycle.',
    type: 'PDF',
    size: '2.4 MB',
    category: 'Statutes',
    publishedDate: 'OCT 12, 2023',
    icon: 'description',
    accentColor: 'border-primary',
    signatory: 'Comité Ejecutivo',
    hashId: 'CH-8829-XQ',
    status: 'Verified Official'
  },
  {
    id: '2',
    title: 'Reglamento Técnico Nacional',
    description: 'Detailed technical requirements for track and field events, athlete equipment, and doping control protocols.',
    type: 'DOCX',
    size: '1.1 MB',
    category: 'Regulations',
    publishedDate: 'JAN 05, 2024',
    icon: 'gavel',
    accentColor: 'border-secondary'
  },
  {
    id: '3',
    title: 'Actas de Asamblea Extraordinaria',
    description: 'Resolutions and voting records from the December 2023 session regarding stadium modernization.',
    type: 'PDF',
    size: '4.8 MB',
    category: 'Assembly Acts',
    publishedDate: 'DEC 20, 2023',
    icon: 'contract',
    accentColor: 'border-primary'
  },
  {
    id: '4',
    title: 'Manual de Convivencia Atleta',
    description: 'Code of conduct and ethics for athletes representing the Chocó Federation in international meets.',
    type: 'PDF',
    size: '850 KB',
    category: 'Regulations',
    publishedDate: 'FEB 14, 2024',
    icon: 'inventory_2',
    accentColor: 'border-tertiary'
  }
];

export const CATEGORIES: Category[] = [
  {
    id: 'hist',
    title: 'Historical Acts',
    description: 'Archive of all board decisions from 1998-2023.',
    icon: 'history_edu',
    bgColor: 'bg-surface-container-high'
  },
  {
    id: 'infra',
    title: 'Infrastructure',
    description: 'Plans and permits for Chocó athletic facilities.',
    icon: 'stadium',
    bgColor: 'bg-secondary-container'
  },
  {
    id: 'transp',
    title: 'Transparency',
    description: 'Annual budget reports and public audits.',
    icon: 'payments',
    bgColor: 'bg-tertiary-container'
  },
  {
    id: 'clubs',
    title: 'Clubs',
    description: 'Registry and certification of local sports clubs.',
    icon: 'group_work',
    bgColor: 'bg-surface-container-highest'
  }
];
