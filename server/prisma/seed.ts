
import 'dotenv/config';

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const fullName = process.env.ADMIN_FULL_NAME?.trim();
  const employeeId = process.env.ADMIN_EMPLOYEE_ID?.trim().toUpperCase();
  const phone = process.env.ADMIN_PHONE?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  const requiredValues = {
    ADMIN_FULL_NAME: fullName,
    ADMIN_EMPLOYEE_ID: employeeId,
    ADMIN_PHONE: phone,
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: password,
  };

  for (const [key, value] of Object.entries(requiredValues)) {
    if (!value) {
      throw new Error(`${key} is missing from the .env file.`);
    }
  }

  if (fullName!.length < 3 || fullName!.length > 60) {
    throw new Error('Administrator name must be 3–60 characters.');
  }

  if (!/^[\p{L} ]+$/u.test(fullName!)) {
    throw new Error('Administrator name must contain only letters and spaces.');
  }

  if (!/^[A-Z0-9-]{3,20}$/.test(employeeId!)) {
    throw new Error('Invalid administrator employee ID.');
  }

  if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone!)) {
    throw new Error('Invalid Bangladeshi administrator phone number.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email!)) {
    throw new Error('Invalid administrator email address.');
  }

  const companyDomain = process.env.COMPANY_EMAIL_DOMAIN?.trim().toLowerCase();

  if (!companyDomain || !email!.endsWith(`@${companyDomain}`)) {
    throw new Error('Administrator email must use the configured company domain.');
  }

  if (
    password!.length < 8 ||
    !/[a-z]/.test(password!) ||
    !/[A-Z]/.test(password!) ||
    !/\d/.test(password!) ||
    !/[^A-Za-z0-9]/.test(password!)
  ) {
    throw new Error(
      'Administrator password must contain uppercase, lowercase, number, and special character.',
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { employeeId },
        { phone },
      ],
    },
  });

  if (existingUser) {
    const sameAdministrator =
      existingUser.email === email &&
      existingUser.employeeId === employeeId &&
      existingUser.phone === phone;

    if (sameAdministrator && existingUser.role === UserRole.ADMIN) {
      console.log('Administrator account already exists. No changes made.');
      return;
    }

    throw new Error(
      'One or more administrator identifiers already belong to another account. No changes made.',
    );
  }

  const hashedPassword = await bcrypt.hash(password!, 10);

  await prisma.user.create({
    data: {
      fullName: fullName!,
      employeeId: employeeId!,
      phone: phone!,
      email: email!,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('Administrator account created successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('Administrator seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
