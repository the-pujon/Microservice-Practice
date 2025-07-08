/*
  Warnings:

  - The values [FAILURE] on the enum `LoginAttempt` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LoginAttempt_new" AS ENUM ('SUCCESS', 'FAILED');
ALTER TABLE "LoginHistory" ALTER COLUMN "attempt" DROP DEFAULT;
ALTER TABLE "LoginHistory" ALTER COLUMN "attempt" TYPE "LoginAttempt_new" USING ("attempt"::text::"LoginAttempt_new");
ALTER TYPE "LoginAttempt" RENAME TO "LoginAttempt_old";
ALTER TYPE "LoginAttempt_new" RENAME TO "LoginAttempt";
DROP TYPE "LoginAttempt_old";
ALTER TABLE "LoginHistory" ALTER COLUMN "attempt" SET DEFAULT 'SUCCESS';
COMMIT;
