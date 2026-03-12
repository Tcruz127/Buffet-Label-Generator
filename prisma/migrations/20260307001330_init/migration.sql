-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelSheet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventName" TEXT,
    "totalLabels" INTEGER NOT NULL DEFAULT 10,
    "settings" JSONB,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabelSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelItem" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "positionIndex" INTEGER NOT NULL,
    "foodName" TEXT,
    "diets" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabelItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LabelItem_sheetId_positionIndex_key" ON "LabelItem"("sheetId", "positionIndex");

-- AddForeignKey
ALTER TABLE "LabelSheet" ADD CONSTRAINT "LabelSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelItem" ADD CONSTRAINT "LabelItem_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "LabelSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
