import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../src/types/models';

let user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  theme: 'light',
  defaultPriority: 'medium',
  age: 30
};

export async function GET() {
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  user = { ...user, ...data };
  return NextResponse.json(user);
} 