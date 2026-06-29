export class Ticket {
  id: number;
  ticketId: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
}
