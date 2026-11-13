-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "grade_rules" (
    "id" SERIAL NOT NULL,
    "grade" TEXT NOT NULL,
    "minPercent" DECIMAL(5,2) NOT NULL,
    "gradePoint" DECIMAL(4,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_rules_grade_key" ON "grade_rules"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "grade_rules_minPercent_key" ON "grade_rules"("minPercent");
