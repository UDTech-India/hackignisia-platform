-- ============================================================================
-- HackIGNISIA — Submissions Bucket Server-Side Validation
-- ============================================================================

UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10 MB
  allowed_mime_types = ARRAY[
    'application/pdf', 
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'submissions';
