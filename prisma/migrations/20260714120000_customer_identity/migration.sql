-- AlterTable
ALTER TABLE "user" ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Address" ADD COLUMN "isDefaultShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isDefaultBilling" BOOLEAN NOT NULL DEFAULT false;
