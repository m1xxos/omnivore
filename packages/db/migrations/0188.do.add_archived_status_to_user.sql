-- Type: DO
-- Name: add_archived_status_to_user
-- Description: Add ARCHIVED status to the user table

BEGIN;

ALTER TYPE user_status_type ADD VALUE IF NOT EXISTS 'ARCHIVED';

COMMIT;