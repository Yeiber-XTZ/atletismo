export interface Document {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'DOCX' | 'XLSX';
  size: string;
  category: string;
  publishedDate: string;
  icon: string;
  accentColor: string;
  signatory?: string;
  hashId?: string;
  status?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}
