import os
import requests
import json
import time

API_BASE = "http://localhost:8000"

def run_tests():
    print("====================================================")
    print(" INICIANDO PRUEBAS DE INTEGRACIÓN: EL CHANGARRO SABE")
    print("====================================================")
    
    # 1. Check if backend is running
    print("\n1. Verificando estado del servidor backend...")
    try:
        res = requests.get(f"{API_BASE}/api/dias-guardados")
        if res.status_code == 200:
            print("   [OK] Servidor backend activo y respondiendo!")
        else:
            print(f"   [ERROR] Servidor respondió con código {res.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("   [ERROR] No se pudo conectar al servidor backend. ¿Está corriendo en http://localhost:8000?")
        print("   Inicia el servidor ejecutando: backend/venv/Scripts/python.exe main.py")
        return

    # 2. Reset database for clean test
    print("\n2. Limpiando libreta de cuentas (Base de datos)...")
    res = requests.delete(f"{API_BASE}/api/limpiar-db")
    print(f"   Respuesta: {res.json()}")

    # 3. Test Loading Demo Data (Monday and Tuesday)
    print("\n3. Cargando registros históricos de prueba (Días 1 y 2)...")
    demo_payload = [
        {
            "fecha": "2026-07-29",
            "transcripcion": "Pues hoy estuvo tranquilo, vendí como 20 de rajas y 15 de frijol, el mole casi no se movió, me sobraron como 8. Gasté 180 en gas y 50 en tortillas."
        },
        {
            "fecha": "2026-07-30",
            "transcripcion": "Hoy sí estuvo bueno, se me acabó todo el picadillo bien rápido, tuve que hacer más rajas a medio día porque también se acabaron. El chicharrón otra vez me sobró harto. Gasté 200 en insumos y 40 en bolsas."
        }
    ]
    
    res = requests.post(f"{API_BASE}/api/cargar-demo", json=demo_payload)
    if res.status_code == 200:
        print("   [OK] Días 1 y 2 cargados con éxito!")
        print(json.dumps(res.json(), indent=2, ensure_ascii=False))
    else:
        print(f"   [ERROR] Fallo al cargar demo: {res.text}")
        return

    # 4. Test uploading audio file (Day 3)
    print("\n4. Probando transcripción y procesamiento de audio (Día 3)...")
    audio_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "demo_audios", "dia3.mp3"))
    if not os.path.exists(audio_path):
        print(f"   [ERROR] No se encontró el archivo de audio demo en {audio_path}")
        return
        
    print(f"   Enviando {audio_path} al backend...")
    start_time = time.time()
    with open(audio_path, "rb") as audio_file:
        files = {"audio": ("dia3.mp3", audio_file, "audio/mp3")}
        data = {"fecha": "2026-07-31"}
        res = requests.post(f"{API_BASE}/api/registrar-dia", files=files, data=data)
        
    duration = time.time() - start_time
    if res.status_code == 200:
        print(f"   [OK] Día 3 procesado con éxito en {duration:.2f} segundos!")
        res_data = res.json()
        print("\n   --- Resultados del Día 3 ---")
        print(f"   Transcripción: \"{res_data['transcripcion']}\"")
        print(f"   Consolidado Aritmético: {res_data['consolidado']}")
        print(f"   Ventas: {res_data['registros_extraidos']['ventas']}")
        print(f"   Gastos: {res_data['registros_extraidos']['gastos']}")
        print(f"   Resumen Narrado: \"{res_data['resumen']}\"")
    else:
        print(f"   [ERROR] Fallo al procesar audio: {res.status_code} - {res.text}")
        return

    # 5. Test Weekly Insights
    print("\n5. Consultando Insights Semanales (Capa 5)...")
    res = requests.get(f"{API_BASE}/api/insights-semana")
    if res.status_code == 200:
        print("   [OK] Insights generados con éxito!")
        print("\n   --- Insights de la Semana ---")
        print(res.json()["insights"])
    else:
        print(f"   [ERROR] Fallo al obtener insights: {res.text}")
        
    print("\n====================================================")
    print(" PRUEBAS COMPLETADAS")
    print("====================================================")

if __name__ == "__main__":
    run_tests()
