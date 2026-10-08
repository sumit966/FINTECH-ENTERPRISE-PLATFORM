SELECT 'Repository'   AS table_name, COUNT(*) FROM "Repository"
UNION ALL SELECT 'PullRequest',    COUNT(*) FROM "PullRequest"
UNION ALL SELECT 'Build',          COUNT(*) FROM "Build"
UNION ALL SELECT 'TestRun',        COUNT(*) FROM "TestRun"
UNION ALL SELECT 'Deployment',     COUNT(*) FROM "Deployment";