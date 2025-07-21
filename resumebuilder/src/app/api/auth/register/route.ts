import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { firstName, lastName, email, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      name: `${firstName} ${lastName}`,
      personalInfo: {
        firstName,
        lastName,
        summary: 'Professional summary will be added here.',
        contactInfo: {
          email,
        },
      },
      preferences: {
        defaultTemplate: 'modern',
        privacySettings: {
          profileVisibility: 'private',
          contactInfoVisibility: 'private',
          resumeVisibility: 'private',
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        theme: 'light',
        language: 'en',
      },
      analytics: {
        resumesCreated: 0,
        resumesDownloaded: 0,
        lastActive: new Date(),
        totalTimeSpent: 0,
        favoriteTemplates: [],
      },
    });

    await user.save();

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 