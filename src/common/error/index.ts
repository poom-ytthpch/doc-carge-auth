import { HttpException, HttpStatus } from '@nestjs/common';
import { error } from 'console';
import { GraphQLError } from 'graphql';

export const GqlError = {
  BadRequest: (msg: string, details?: any, gql = true) =>
    gql
      ? new GraphQLError(msg, {
          extensions: {
            code: 'BAD_USER_INPUT',
            http: { status: HttpStatus.BAD_REQUEST },
            details,
          },
        })
      : new HttpException(
          { status: HttpStatus.BAD_REQUEST, error: msg },
          HttpStatus.BAD_REQUEST,
        ),

  Internal: (msg: string, details?: any, gql = true) =>
    gql
      ? new GraphQLError(msg, {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: HttpStatus.INTERNAL_SERVER_ERROR },
            details,
          },
        })
      : new HttpException(
          { status: HttpStatus.INTERNAL_SERVER_ERROR, error: msg },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
};
