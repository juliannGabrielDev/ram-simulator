export interface Process {
  name: string;
  size: number;
  location: 'RAM' | 'Virtual' | 'Inactive';
  icon?: string;
}
