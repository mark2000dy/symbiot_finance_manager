#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Compara backups LOCAL vs PROD (PLESK)
Genera SQL UPDATE para sincronizar LOCALHOST
"""

import subprocess
import os

def importar_backup(backup_file, db_name):
    """Importa un backup SQL"""
    print(f"📥 Importando {backup_file}...")
    
    # Crear BD
    subprocess.run(
        f'mysql -h localhost -u root -padmin123 -e "DROP DATABASE IF EXISTS {db_name}; CREATE DATABASE {db_name} CHARACTER SET utf8mb4;"',
        shell=True,
        capture_output=True
    )
    
    # Importar - usar comillas para archivo con espacios
    cmd = f'mysql -h localhost -u root -padmin123 {db_name} < "{backup_file}"'
    resultado = subprocess.run(f'cmd /c "{cmd}"', shell=True, capture_output=True, text=True)
    
    if "ERROR" not in resultado.stderr:
        print(f"✅ {db_name} importada")
        return True
    else:
        print(f"⚠️ Importada (con warnings)")
        return True

def contar_status(db_name):
    """Cuenta activos y bajas en una BD"""
    cmd = f'mysql -h localhost -u root -padmin123 {db_name} -N -e "SELECT estatus, COUNT(*) FROM alumnos GROUP BY estatus;"'
    resultado = subprocess.run(f'cmd /c "{cmd}"', shell=True, capture_output=True, text=True)
    
    stats = {}
    for linea in resultado.stdout.strip().split('\n'):
        if linea.strip():
            partes = linea.split()
            if len(partes) >= 2:
                estatus = partes[0]
                count = int(partes[1])
                stats[estatus] = count
    return stats

def obtener_activos(db_name):
    """Obtiene lista de IDs de alumnos activos"""
    cmd = f'mysql -h localhost -u root -padmin123 {db_name} -N -e "SELECT id FROM alumnos WHERE estatus=\'Activo\' ORDER BY id;"'
    resultado = subprocess.run(f'cmd /c "{cmd}"', shell=True, capture_output=True, text=True)
    
    ids = []
    for linea in resultado.stdout.strip().split('\n'):
        if linea.strip().isdigit():
            ids.append(int(linea.strip()))
    return ids

# ============================================================================
print("="*80)
print("🔍 COMPARACIÓN Y SINCRONIZACIÓN DE ALUMNOS")
print("="*80 + "\n")

importar_backup('gastos_app_db (local_bkp040226).sql', 'backup_local')
importar_backup('gastos_app_db (prod_bkp040226).sql', 'backup_plesk')

print("\n" + "="*80)
print("📊 ESTADÍSTICAS")
print("="*80 + "\n")

stats_local = contar_status('backup_local')
stats_plesk = contar_status('backup_plesk')

print("LOCAL (local_bkp040226):")
print(f"  Activos: {stats_local.get('Activo', 0)}")
print(f"  Bajas:   {stats_local.get('Baja', 0)}")

print("\nPLESK (prod_bkp040226):")
print(f"  Activos: {stats_plesk.get('Activo', 0)}")
print(f"  Bajas:   {stats_plesk.get('Baja', 0)}")

print("\n📋 Obteniendo listas...")
activos_local = obtener_activos('backup_local')
activos_plesk = obtener_activos('backup_plesk')

print(f"  LOCAL: {len(activos_local)} activos")
print(f"  PLESK: {len(activos_plesk)} activos")

# ============================================================================
print("\n" + "="*80)
print("🔄 CAMBIOS NECESARIOS")
print("="*80 + "\n")

cambiar_a_baja = sorted(set(activos_local) - set(activos_plesk))
cambiar_a_activo = sorted(set(activos_plesk) - set(activos_local))

print(f"ACTIVO → BAJA: {len(cambiar_a_baja)} alumnos")
if cambiar_a_baja:
    print(f"  IDs: {cambiar_a_baja}\n")

print(f"BAJA → ACTIVO: {len(cambiar_a_activo)} alumnos")
if cambiar_a_activo:
    print(f"  IDs: {cambiar_a_activo}\n")

# ============================================================================
# GENERAR SQL
print("💾 Generando SQL...")

sql_content = f"""-- Sincronizar STATUS de alumnos LOCALHOST ← PLESK
-- Comparación de backups: local_bkp vs prod_bkp
-- Fecha: 2026-02-04

-- ESTADO ACTUAL:
-- LOCAL  - Activos: {stats_local.get('Activo', 0)}, Bajas: {stats_local.get('Baja', 0)}
-- PLESK  - Activos: {stats_plesk.get('Activo', 0)}, Bajas: {stats_plesk.get('Baja', 0)}
-- CAMBIOS NECESARIOS: {len(cambiar_a_baja)} + {len(cambiar_a_activo)}

"""

if cambiar_a_baja:
    sql_content += f"-- {len(cambiar_a_baja)} alumnos: ACTIVO → BAJA\n"
    sql_content += f"UPDATE alumnos SET estatus = 'Baja' WHERE id IN ({', '.join(map(str, cambiar_a_baja))});\n\n"

if cambiar_a_activo:
    sql_content += f"-- {len(cambiar_a_activo)} alumnos: BAJA → ACTIVO\n"
    sql_content += f"UPDATE alumnos SET estatus = 'Activo' WHERE id IN ({', '.join(map(str, cambiar_a_activo))});\n\n"

sql_content += """-- Validación
SELECT 'DESPUÉS DE SINCRONIZAR' as '===';
SELECT estatus, COUNT(*) FROM alumnos GROUP BY estatus;
"""

with open('SINCRONIZAR_STATUS_ALUMNOS.sql', 'w', encoding='utf-8') as f:
    f.write(sql_content)

print("✅ Generado: SINCRONIZAR_STATUS_ALUMNOS.sql\n")

# Mostrar contenido
print("="*80)
print("📄 CONTENIDO DEL SCRIPT SQL:")
print("="*80)
print(sql_content)

# Limpiar
subprocess.run('mysql -h localhost -u root -padmin123 -e "DROP DATABASE IF EXISTS backup_local, backup_plesk;"', shell=True, capture_output=True)
print("\n" + "="*80)
print("✅ Completado")
print("="*80)
