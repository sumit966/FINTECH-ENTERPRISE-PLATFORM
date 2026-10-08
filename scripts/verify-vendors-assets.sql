SELECT 'Vendor'        AS table_name, COUNT(*) FROM "Vendor"
UNION ALL SELECT 'PurchaseOrder',     COUNT(*) FROM "PurchaseOrder"
UNION ALL SELECT 'Asset',             COUNT(*) FROM "Asset"
UNION ALL SELECT 'License',           COUNT(*) FROM "License";