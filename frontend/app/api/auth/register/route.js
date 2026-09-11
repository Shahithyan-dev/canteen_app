import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, rollNo, classSection, department, staffCode } = body;

    if (!name || !email || !password || !rollNo || !classSection || !department) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { rollNo: rollNo.toUpperCase() }] });
    if (existingUser) {
      return NextResponse.json({ message: 'Email or Roll No already registered.' }, { status: 409 });
    }

    const role = staffCode === 'CANTEEN2026' ? 'staff' : 'student';

    const user = await User.create({ name, email, password, rollNo, classSection, department, role });

    return NextResponse.json(
      {
        message: 'Registration successful!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          rollNo: user.rollNo,
          classSection: user.classSection,
          department: user.department,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Server error during registration.' }, { status: 500 });
  }
}
