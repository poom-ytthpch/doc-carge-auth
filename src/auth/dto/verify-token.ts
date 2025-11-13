import { User } from 'generated/prisma/client';

export class VerifyTokenResponse {
  message?: string;
  data?: User;
  status?: boolean;
}
