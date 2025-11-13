
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class MobileRegisterRequest {
    mobile: string;
    pin: string;
}

export class LoginRequest {
    mobile: string;
    pin: string;
}

export class VerifyOtpInput {
    mobile: string;
    refId: string;
    otp: string;
}

export class SendOtpInput {
    mobile: string;
    purpose: string;
}

export class User {
    id?: Nullable<string>;
    email?: Nullable<string>;
    userId?: Nullable<string>;
    mobile?: Nullable<string>;
    pin?: Nullable<string>;
    updatedAt?: Nullable<Date>;
    createdAt?: Nullable<Date>;
}

export class LoginResponse {
    status: boolean;
    message: string;
    token?: Nullable<string>;
}

export abstract class IQuery {
    abstract getUserByMobile(mobile: string): User | Promise<User>;
}

export abstract class IMutation {
    abstract mobileRegister(input: MobileRegisterRequest): CommonResponse | Promise<CommonResponse>;

    abstract login(input: LoginRequest): LoginResponse | Promise<LoginResponse>;

    abstract sendOtp(input: SendOtpInput): SendOtpResponse | Promise<SendOtpResponse>;

    abstract verifyOtp(input: VerifyOtpInput): boolean | Promise<boolean>;
}

export class CommonResponse {
    status: boolean;
    message: string;
}

export class SendOtpResponse {
    refId?: Nullable<string>;
    expiredAt?: Nullable<Date>;
    otp?: Nullable<string>;
}

type Nullable<T> = T | null;
