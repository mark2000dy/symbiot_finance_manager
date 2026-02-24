#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Compara backups LOCAL vs PROD (PLESK)
Identifica los 15 alumnos que están con status INCORRECTO en LOCALHOST
Genera SQL UPDATE para sincronizar
"""

import subprocess
import re

def importar_backup(backup_file, db_name, user='root', password='admin123'):
    """Importa un backup SQL en una BD temporal"""
    print(f"📥 Importando {backup_file}...")
    
    # Crear BD
    subprocess.run(
        f'mysql -h localhost -u {user} -p{password} -e "DROP DATABASE IF EXISTS {db_name}; CREATE DATABASE {db_name} CHARACTER SET utf8mb4;"',
        shell=True,
        capture_output=True
    )
    
    # Importar backup
    resultado = subprocess.run(
        f'cmd /c "mysql -h localhost -u {user} -p{password} {db_name} < {backup_file}"',
        shell=True,
        capture_output=True,
        text=True
    )
    
    if resultado.returncode == 0:
        print(f"✅ {db_name} importada")
        return True
    else:
        print(f"❌ Error: {resultado.stderr[:200]}")
        return False

def contar_status(db_name, user='root', password='admin123'):
    """Cuenta activos y bajas en una BD"""
    cmd = f'mysql -h localhost -u {user} -p{password} {db_name} -e "SELECT estatus, COUNT(*) as total FROM alumnos GROUP BY estatus;"'
    resultado = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    lineas = resultado.stdout.strip().split('\n')
    stats = {}
    for linea in lineas[1:]:
        if linea.strip():
            partes = linea.split()
            if len(partes) >= 2:
                estatus = partes[0]
                count = int(partes[1])
                stats[estatus] = count
    
    return stats

def obtener_activos(db_name, user='root', password='admin123'):
    """Obtiene lista de IDs de alumnos activos"""
    cmd = f'mysql -h localhost -u {user} -p{password} {db_name} -N -e "SELECT id FROM alumnos WHERE estatus=\'Activo\' ORDER BY id;"'
    resultado = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    ids = []
    for linea in resultado.stdout.strip().split('\n'):
        if linea.strip().isdigit():
            ids.append(int(linea.strip()))
    return ids

# ============================================================================
# IMPORTAR BACKUPS
# ============================================================================
print("="*80)
print("🔍 COMPARACIÓN Y SINCRONIZACIÓN DE ALUMNOS")
print("="*80 + "\n")

importar_backup('gastos_app_db (local_bkp040226).sql', 'backup_local')
importar_backup('gastos_app_db (prod_bkp040226).sql', 'backup_plesk')

# ============================================================================
# COMPARAR ESTADÍSTICAS
# ============================================================================
print("\n" + "="*80)
print("📊 ESTADÍSTICAS")
print("="*80 + "\n")

stats_local = contar_status('backup_local')
stats_plesk = contar_status('backup_plesk')

print("LOCAL (Backup local_bkp040226):")
print(f"  Activos: {stats_local.get('Activo', 0)}")
print(f"  Bajas:   {stats_local.get('Baja', 0)}")

print("\nPLESK (Backup prod_bkp040226):")
print(f"  Activos: {stats_plesk.get('Activo', 0)}")
print(f"  Bajas:   {stats_plesk.get('Baja', 0)}")

# ============================================================================
# OBTENER LISTAS DE ACTIVOS
# ============================================================================
print("\n📋 Obteniendo listas de alumnos activos...")
activos_local = obtener_activos('backup_local')
activos_plesk = obtener_activos('backup_plesk')

print(f"  LOCAL tiene {len(activos_local)} activos")
print(f"  PLESK tiene {len(activos_plesk)} activos")

# ============================================================================
# IDENTIFICAR DIFERENCIAS
# ============================================================================
print("\n" + "="*80)
print("🔄 IDENTIFICAR CAMBIOS")
print("="*80 + "\n")

# Alumnos que están ACTIVOS en LOCAL pero BAJA en PLESK (hay que cambiar a BAJA)
cambiar_a_baja = sorted(set(activos_local) - set(activos_plesk))
# Alumnos que están BAJA en LOCAL pero ACTIVOS en PLESK (hay que cambiar a ACTIVO)
cambiar_a_activo = sorted(set(activos_plesk) - set(activos_local))

print(f"Alumnos que deben cambiar de ACTIVO → BAJA: {len(cambiar_a_baja)}")
if cambiar_a_baja:
    print(f"  IDs: {cambiar_a_baja}")

print(f"\nAlumnos que deben cambiar de BAJA → ACTIVO: {len(cambiar_a_activo)}")
if cambiar_a_activo:
    print(f"  IDs: {cambiar_a_activo}")

# ============================================================================
# GENERAR SQL UPDATE
# ============================================================================
print("\n" + "="*80)
print("💾 GENERAR SQL PARA SINCRONIZAR LOCALHOST")
print("="*80 + "\n")

sql_content = """-- ============================================================================
-- SINCRONIZAR STATUS DE ALUMNOS: LOCALHOST ← PLESK
-- Basado en comparación de backups
-- Fecha: 2026-02-04
-- ============================================================================

-- ESTADO ACTUAL LOCALHOST:
-- Activos: """ + str(stats_local.get('Activo', 0)) + """
-- Bajas:   """ + str(stats_local.get('Baja', 0)) + """

-- ESTADO ESPERADO (PLESK):
-- Activos: """ + str(stats_plesk.get('Activo', 0)) + """
-- Bajas:   """ + str(stats_plesk.get('Baja', 0)) + """

-- ============================================================================
-- CAMBIOS NECESARIOS
-- ============================================================================
"""

if cambiar_a_baja:
    sql_content += f"\n-- CAMBIAR {len(cambiar_a_baja)} ALUMNOS DE ACTIVO → BAJA\n"
    sql_content += f"UPDATE alumnos SET estatus = 'Baja' WHERE id IN ({', '.join(map(str, cambiar_a_baja))});\n"

if cambiar_a_activo:
    sql_content += f"\n-- CAMBIAR {len(cambiar_a_activo)} ALUMNOS DE BAJA → ACTIVO\n"
    sql_content += f"UPDATE alumnos SET estatus = 'Activo' WHERE id IN ({', '.join(map(str, cambiar_a_activo))});\n"

sql_content += """
-- ============================================================================
-- VERIFICACIÓN POST-SINCRONIZACIÓN
-- ============================================================================
SELECT estatus, COUNT(*) as total FROM alumnos GROUP BY estatus;
-- Esperado:
-- Activo: """ + str(stats_plesk.get('Activo', 0)) + """
-- Baja:   """ + str(stats_plesk.get('Baja', 0)) + """
"""

# Guardar archivo
with open('SINCRONIZAR_STATUS_ALUMNOS.sql', 'w', encoding='utf-8') as f:
    f.write(sql_content)

print("✅ SQL generado: SINCRONIZAR_STATUS_ALUMNOS.sql\n")
print(sql_content)

# ============================================================================
# LIMPIAR BDs TEMPORALES
# ============================================================================
print("\n" + "="*80)
print("🧹 Limpiando...")
subprocess.run('mysql -h localhost -u root -padmin123 -e "DROP DATABASE IF EXISTS backup_local, backup_plesk;"', shell=True, capture_output=True)
print("✅ Completado\n")
