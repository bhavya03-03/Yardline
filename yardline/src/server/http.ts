import { NextResponse } from 'next/server';
import { AppError } from './validation';
export function failure(error: unknown) {
  if (error instanceof AppError)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  const message = error instanceof Error ? error.message : '';
  if (/UNIQUE constraint|duplicate key/i.test(message))
    return NextResponse.json(
      {
        error: {
          code: 'CONFLICT',
          message:
            'This identifier or storage position is already in use. Review the latest yard data.',
        },
      },
      { status: 409 },
    );
  console.error('[yardline]', error);
  return NextResponse.json(
    {
      error: {
        code: 'DATABASE_ERROR',
        message:
          'The operation could not be completed. The last confirmed state is preserved. Check the server database connection and try again.',
      },
    },
    { status: 503 },
  );
}
