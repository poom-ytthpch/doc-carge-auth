export class CreateAuthInput {}

export class CreateUserInput {
    mobile: string;
    email?: string;
    password?: string;
    pin: string;
}
