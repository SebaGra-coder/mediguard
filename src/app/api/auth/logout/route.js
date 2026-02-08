import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');

    return NextResponse.json({ message: 'Logout effettuato' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Errore durante il logout' }, { status: 500 });
  }
}