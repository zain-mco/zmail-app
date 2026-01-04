-- Check for campaigns with blocks that have empty IDs
SELECT id, title, content 
FROM Campaign 
WHERE content LIKE '%"id":"",%' 
   OR content LIKE '%"id": "",%'
   OR content = '{"blocks":[{"id":""}]}';
