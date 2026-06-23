INSERT INTO "User" ("id", "phone", "role", "firstName", "passwordHash", "passcodeSetup", "updatedAt")
VALUES 
  (gen_random_uuid(), '0820000001', 'ADMIN', 'George', 'temp_hash', false, NOW()),
  (gen_random_uuid(), '0820000002', 'SALES', 'Tanya', 'temp_hash', false, NOW()),
  (gen_random_uuid(), '0820000003', 'SALES', 'Cherine', 'temp_hash', false, NOW())
ON CONFLICT ("phone") DO NOTHING;
