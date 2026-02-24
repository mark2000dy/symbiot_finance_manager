#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comparar backups LOCAL vs PROD (PLESK)
Archivo: gastos_app_db (local_bkp040226).sql
Archivo: gastos_app_db (prod_bkp040226).sql
"""

import re

def analizar_backup_alumnos(archivo_sql):
    """Extrae tabla alumnos del backup SQL"""
    alumnos = {}
    
    with open(archivo_sql, 'r', encoding='utf-8', errors='ignore') as f:
        contenido = f.read()
    
    # Buscar la sección INSERT INTO alumnos
    patron_insert = r"INSERT INTO `alumnos`[^;]*VALUES\s*(\(.*?\);)"
    match = re.search(patron_insert, contenido, re.DOTALL)
    
    if not match:
        print(f"❌ No se encontró INSERT en {archivo_sql}")
        return {}
    
    valores_str = match.group(1)
    
    # Extraer cada tupla (fila)
    tuplas = re.findall(r"\(([^()]+(?:'[^']*'[^()]*)*)\)", valores_str)
    
    for tupla_str in tuplas:
        # Parsear valores
        valores = []
        en_string = False
        valor_actual = ""
        
        for i, c in enumerate(tupla_str):
            if c == "'" and (i == 0 or tupla_str[i-1] != "\\"):
                en_string = not en_string
                valor_actual += c
            elif c == "," and not en_string:
                valores.append(valor_actual.strip())
                valor_actual = ""
            else:
                valor_actual += c
        
        if valor_actual:
            valores.append(valor_actual.strip())
        
        # El primer valor es el ID
        if valores:
            try:
                alumno_id = int(valores[0])
                # Nombre es el segundo valor (índice 1)
                nombre = valores[1] if len(valores) > 1 else "SIN NOMBRE"
                # Limpiar comillas del nombre
                if nombre.startswith("'") and nombre.endswith("'"):
                    nombre = nombre[1:-1]
                
                alumnos[alumno_id] = {
                    'nombre': nombre,
                    'valores_raw': valores
                }
            except (ValueError, IndexError):
                pass
    
    return alumnos

# Analizar ambos backups
print("=" * 80)
print("📊 ANALISIS COMPARATIVO: LOCAL vs PROD (PLESK)")
print("=" * 80)

local = analizar_backup_alumnos("gastos_app_db (local_bkp040226).sql")
prod = analizar_backup_alumnos("gastos_app_db (prod_bkp040226).sql")

print(f"\n📍 LOCALHOST (local_bkp040226.sql):")
print(f"   Total alumnos: {len(local)}")

print(f"\n📍 PLESK/PROD (prod_bkp040226.sql):")
print(f"   Total alumnos: {len(prod)}")

print(f"\n📊 DIFERENCIA:")
print(f"   PROD - LOCAL: {len(prod) - len(local)} alumnos")

# IDs únicos
ids_local = set(local.keys())
ids_prod = set(prod.keys())

nuevos_en_prod = ids_prod - ids_local
faltantes_en_prod = ids_local - ids_prod
comunes = ids_local & ids_prod

print(f"\n🆕 Alumnos NUEVOS en PROD (no en LOCAL):")
print(f"   Total: {len(nuevos_en_prod)}")
if nuevos_en_prod:
    for aid in sorted(nuevos_en_prod)[:10]:
        print(f"   - ID {aid}: {prod[aid]['nombre']}")
    if len(nuevos_en_prod) > 10:
        print(f"   ... y {len(nuevos_en_prod) - 10} más")

print(f"\n❌ Alumnos FALTANTES en PROD (en LOCAL pero no en PROD):")
print(f"   Total: {len(faltantes_en_prod)}")
if faltantes_en_prod:
    for aid in sorted(faltantes_en_prod)[:5]:
        print(f"   - ID {aid}: {local[aid]['nombre']}")
    if len(faltantes_en_prod) > 5:
        print(f"   ... y {len(faltantes_en_prod) - 5} más")

print(f"\n✅ Alumnos en AMBAS bases:")
print(f"   Total: {len(comunes)}")

print("\n" + "=" * 80)
print("📋 RESUMEN")
print("=" * 80)
print(f"""
LOCAL:      {len(local)} alumnos
PROD:       {len(prod)} alumnos
Diferencia: {len(prod) - len(local):+d}

Nuevos en PROD:      {len(nuevos_en_prod)}
Faltantes en PROD:   {len(faltantes_en_prod)}
En ambas:            {len(comunes)}

Próximos pasos:
1. Sincronizar {len(nuevos_en_prod)} alumnos nuevos de PROD a LOCAL
2. Generar script de UPDATE para todas las fechas_ultimo_pago
3. Crear triggers automáticos
""")
