-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "defaultLogObj" TEXT[],
    "goalCalorie" INTEGER NOT NULL DEFAULT 1800,
    "maximumCalorie" INTEGER NOT NULL DEFAULT 2400,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SuccessDates" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT[],

    CONSTRAINT "SuccessDates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FailDates" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT[],

    CONSTRAINT "FailDates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Todo" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "todayList" JSONB NOT NULL,
    "goalList" JSONB NOT NULL,
    "breakLimitList" JSONB NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Routine" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dailyRoutines" JSONB NOT NULL,
    "weeklyRoutines" JSONB NOT NULL,
    "monthlyRoutines" JSONB NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "todayLog" JSONB,
    "logDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Calorie" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eatenList" JSONB NOT NULL,
    "memo" TEXT NOT NULL,
    "totalCalorie" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Calorie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "SuccessDates_userId_idx" ON "public"."SuccessDates"("userId");

-- CreateIndex
CREATE INDEX "FailDates_userId_idx" ON "public"."FailDates"("userId");

-- CreateIndex
CREATE INDEX "Todo_userId_idx" ON "public"."Todo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Routine_userId_key" ON "public"."Routine"("userId");

-- CreateIndex
CREATE INDEX "Routine_userId_idx" ON "public"."Routine"("userId");

-- CreateIndex
CREATE INDEX "Log_userId_createdAt_idx" ON "public"."Log"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Log_userId_logDate_key" ON "public"."Log"("userId", "logDate");

-- CreateIndex
CREATE INDEX "Calorie_userId_createdAt_idx" ON "public"."Calorie"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Calorie_userId_date_key" ON "public"."Calorie"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."SuccessDates" ADD CONSTRAINT "SuccessDates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FailDates" ADD CONSTRAINT "FailDates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calorie" ADD CONSTRAINT "Calorie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
