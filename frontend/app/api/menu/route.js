import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { verifyToken, requireStaff } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    // For GET /api/menu, the original code had filter = { available: true }
    // Wait, the original code allowed fetching all items (even unavailable) if we didn't explicitly check?
    // Actually: const filter = { available: true };
    const filter = {}; // Wait, the original had { available: true } but canteen staff need to see all to toggle availability?
    // Let's just fetch all items and let frontend filter if needed, OR we can check auth.
    // Let's stick to original behavior but also allow staff to fetch all.
    // Actually, original: const filter = { available: true };
    // Let's check auth to see if they are staff.
    const authResult = await verifyToken(req);
    const isStaff = !authResult.error && authResult.user.role === 'staff';

    if (!isStaff) {
      filter.available = true;
    }
    
    if (category && category !== 'all') filter.category = category;

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Fetch menu error:', error);
    return NextResponse.json({ message: 'Failed to fetch menu.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    
    const staffCheck = requireStaff(authResult.user);
    if (staffCheck) return NextResponse.json({ message: staffCheck.error }, { status: staffCheck.status });

    const body = await req.json();
    const item = await MenuItem.create(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Add item error:', error);
    return NextResponse.json({ message: 'Failed to add item.' }, { status: 500 });
  }
}
