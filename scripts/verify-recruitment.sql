SELECT 'JobOpening'          AS table_name, COUNT(*) FROM "JobOpening"
UNION ALL SELECT 'Candidate',          COUNT(*) FROM "Candidate"
UNION ALL SELECT 'Interview',          COUNT(*) FROM "Interview"
UNION ALL SELECT 'Question',           COUNT(*) FROM "Question"
UNION ALL SELECT 'Assessment',         COUNT(*) FROM "Assessment"
UNION ALL SELECT 'AssessmentQuestion', COUNT(*) FROM "AssessmentQuestion"
UNION ALL SELECT 'ExamAttempt',        COUNT(*) FROM "ExamAttempt";