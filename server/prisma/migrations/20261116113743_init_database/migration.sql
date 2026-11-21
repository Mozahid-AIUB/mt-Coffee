-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('employee', 'admin');

-- CreateEnum
CREATE TYPE "SnackOrderStatus" AS ENUM ('pending', 'preparing', 'served', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(60) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'employee',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lunch_menus" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "cutoffAt" TIMESTAMPTZ(6) NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lunch_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lunch_dishes" (
    "id" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lunch_dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lunch_checkins" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "dishId" UUID NOT NULL,
    "dishName" TEXT NOT NULL,
    "checkedInAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lunch_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snack_items" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "options" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "snack_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snack_orders" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "options" JSONB,
    "location" VARCHAR(60) NOT NULL,
    "note" VARCHAR(150),
    "status" "SnackOrderStatus" NOT NULL DEFAULT 'pending',
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "snack_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lunch_menus_date_key" ON "lunch_menus"("date");

-- CreateIndex
CREATE UNIQUE INDEX "lunch_dishes_menuId_name_key" ON "lunch_dishes"("menuId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "lunch_dishes_id_menuId_key" ON "lunch_dishes"("id", "menuId");

-- CreateIndex
CREATE INDEX "lunch_checkins_menuId_idx" ON "lunch_checkins"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "lunch_checkins_userId_date_key" ON "lunch_checkins"("userId", "date");

-- CreateIndex
CREATE INDEX "snack_orders_userId_createdAt_idx" ON "snack_orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "snack_orders_status_createdAt_idx" ON "snack_orders"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- AddForeignKey
ALTER TABLE "lunch_menus" ADD CONSTRAINT "lunch_menus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lunch_dishes" ADD CONSTRAINT "lunch_dishes_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "lunch_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lunch_checkins" ADD CONSTRAINT "lunch_checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lunch_checkins" ADD CONSTRAINT "lunch_checkins_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "lunch_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lunch_checkins" ADD CONSTRAINT "lunch_checkins_dishId_menuId_fkey" FOREIGN KEY ("dishId", "menuId") REFERENCES "lunch_dishes"("id", "menuId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snack_orders" ADD CONSTRAINT "snack_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snack_orders" ADD CONSTRAINT "snack_orders_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "snack_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
