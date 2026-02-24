"""
Sync production backup to local gastos_app_db.
"""
import re
import subprocess
import sys

SQL_FILE = r'c:\AppServ\www\symbiot\symbiot_finance_manager\gastos_app_db (prod_bkp130226).sql'
OUTPUT_FILE = r'c:\AppServ\www\symbiot\symbiot_finance_manager\_sync_prod_adapted.sql'

with open(SQL_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

adapted = content

# MariaDB -> MySQL 8 compatibility
adapted = adapted.replace('utf8mb4_unicode_ci', 'utf8mb4_0900_ai_ci')
adapted = adapted.replace('current_timestamp()', 'CURRENT_TIMESTAMP')

# Remove ALL CONSTRAINT FOREIGN KEY from CREATE TABLE bodies
adapted = re.sub(r',?\s*CONSTRAINT `[^`]+` FOREIGN KEY[^\n]+\n?', '\n', adapted)
adapted = re.sub(r',\s*\n(\s*\) ENGINE)', r'\n\1', adapted)

# Remove ALTER TABLE that ADD CONSTRAINT FOREIGN KEY
adapted = re.sub(
    r'ALTER TABLE `\w+`\s*\n\s*ADD CONSTRAINT[^;]+;',
    '-- (FK removed)',
    adapted
)

# Remove the entire "Indexes" and "Constraints/Filters" ALTER TABLE sections
# These add PRIMARY KEYs, KEYs, and AUTO_INCREMENT which are already in CREATE TABLE
# Pattern: ALTER TABLE `xxx` followed by ADD ... until ;
adapted = re.sub(
    r'ALTER TABLE `\w+`\s*\n\s*ADD[^;]+;',
    '-- (ALTER removed)',
    adapted
)
# Also remove the MODIFY ALTER TABLE blocks (AUTO_INCREMENT)
adapted = re.sub(
    r'ALTER TABLE `\w+`\s*\n\s*MODIFY[^;]+;',
    '-- (ALTER MODIFY removed)',
    adapted
)

# Remove triggers (require SUPER privilege with binlog)
adapted = re.sub(
    r'DELIMITER \$\$.*?DELIMITER ;',
    '-- (triggers removed for local import)',
    adapted,
    flags=re.DOTALL
)

# Build drop-all prefix
tables = re.findall(r'CREATE TABLE `(\w+)`', adapted)
drop_all = "SET FOREIGN_KEY_CHECKS = 0;\n"
drop_all += "DROP TABLE IF EXISTS `transacciones_prod`;\n"
for t in tables:
    drop_all += f"DROP TABLE IF EXISTS `{t}`;\n"
drop_all += "\n"

suffix = "\nSET FOREIGN_KEY_CHECKS = 1;\n"

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(drop_all)
    f.write(adapted)
    f.write(suffix)

print(f"Tables: {tables}")

# Import
result = subprocess.run(
    ['mysql', '-ugastos_user', '-pGastos2025!', 'gastos_app_db'],
    input=open(OUTPUT_FILE, 'r', encoding='utf-8').read(),
    capture_output=True, text=True, encoding='utf-8'
)

if result.returncode == 0:
    print("Import SUCCESS")
else:
    # Show which line failed
    print(f"FAILED: {result.stderr[:800]}")
