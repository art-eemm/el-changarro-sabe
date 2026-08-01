import os
import json
import base64
import sqlite3
import shutil
from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

app = FastAPI(title="El Changarro Sabe Backend")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELO = "gemma4:e2b"
DB_PATH = "changarro.db"
OLLAMA_HOST = "http://localhost:11434"

# Reference menu from blueprint
MENU_REFERENCIA = {
    "rajas con queso": 13,
    "frijol con chorizo": 13,
    "picadillo": 14,
    "mole": 15,
    "chicharrón en salsa verde": 14,
}

# -------------------------------------------------------------
# System Prompts & Tool Definitions
# -------------------------------------------------------------

SYSTEM_EXTRACCION = """Eres un asistente que ayuda a un changarro de comida a llevar \
registro de su día, a partir de cómo la persona habla naturalmente — nunca le pidas \
que hable distinto.

Recibes la transcripción del día y el menú de referencia del negocio.

Tu tarea es extraer TRES tipos de información usando la herramienta registrar_dia_completo:

1. VENTAS — cualquier mención de haber vendido algo. Si la persona no dice cantidad \
   exacta ("se vendió bien el de rajas"), usa tu mejor estimación basada en el \
   contexto y en frases como "se acabó" (asume que se vendió toda la producción \
   típica de 25 tacos) o "vendí bien" (estimación de unos 15 tacos, no inventes un número exacto \
   si no hay ninguna pista).
   SIEMPRE usa el precio unitario del menú de referencia para cada producto vendido.

2. GASTOS — cualquier mención de dinero gastado, en insumos, transporte, servicios.

3. NOTAS DE INVENTARIO — sobras o faltantes mencionados, útiles para el resumen \
   semanal aunque no tengan impacto monetario directo ese día.

Reglas:
- Mapeo de Variaciones: Si el menú de referencia contiene un producto general o categoría (por ejemplo: "tacos de guisado", "tacos", "empanadas"), y el usuario menciona sabores, ingredientes o guisados específicos (como "pastor", "chicharrón", "huevo", "rajas"), asume que pertenecen a ese producto general y aplícales su precio unitario correspondiente.
- Si el producto vendido no está en el menú de referencia y no se puede asociar a una categoría general, usa un precio estimado razonable (ej. 13 o 14 pesos) o 0 si no se puede inferir.
- Si la persona menciona una cantidad aproximada ("como 15"), regístrala como texto \
  libre en notas_inventario, no inventes precisión que no existe.
- Si algo es ambiguo entre venta y gasto, prioriza el contexto: "compré tortillas" \
  es gasto; "vendí tacos" es venta.
- No inventes ventas o gastos que no se mencionaron.

Llama a la herramienta registrar_dia_completo con todos los elementos extraídos."""

SYSTEM_RESUMEN_DIARIO = """Eres un asistente que le resume su día a un changarro de \
comida, en el mismo tono en el que él mismo habla — nunca en jerga financiera o \
contable. Nada de "utilidad neta" ni "flujo de caja" ni "egresos". Habla como hablaría un amigo \
que le ayuda a llevar cuentas.

Recibes: el consolidado del día (ventas, gastos, ganancia ya calculada) y, si existe, \
la ganancia o resumen del día anterior para poder comparar.

Tu tarea:
1. Menciona la ganancia del día de forma directa y clara.
2. Si algo destaca (un producto que se vendió muy bien o muy mal, un gasto inusual), \
   menciónalo en una frase.
3. Si hay comparación con el día anterior y es relevante, inclúyela brevemente.

Máximo 3 frases. Cálido, directo, cero condescendencia — esta persona sabe de su \
negocio más que nadie, solo le estás ayudando a verlo más claro."""

SYSTEM_INSIGHTS_SEMANALES = """Eres un asistente que ayuda a un changarro de comida a \
entender la semana completa de su negocio, con datos reales de cada día.

Recibes el registro completo de los últimos 7 días: ventas por producto, gastos por \
concepto, y notas de inventario de cada uno.

Tu tarea es identificar patrones ÚTILES Y ACCIONABLES, no solo describir los datos:

- ¿Qué producto se vende consistentemente bien o mal? (usa las notas de inventario \
  de "se_acabo" y "sobrante" como señal, no solo el conteo de ventas)
- ¿Hay un día de la semana con patrón claro de más o menos venta?
- ¿Algún gasto está subiendo de forma notable?
- Una sola recomendación concreta y accionable — no genérica ("vende más") sino \
  específica a lo que ves en los datos ("el chicharrón se quedó sobrante varios días — considera preparar menos cantidad").

Tono coloquial, directo, como un amigo que lleva las cuentas contigo. Máximo 5 \
frases totales. Nunca uses jerga financiera."""

SYSTEM_CONFIGURACION_MENU = """Eres un asistente que ayuda a un changarro de comida a configurar su menú \
o catálogo de productos a partir de su voz o texto natural.

Recibes la transcripción de lo que vende el usuario y a qué precio.
Tu tarea es extraer todos los productos/servicios y sus respectivos precios.

Reglas:
- Extrae el nombre del producto de forma clara (ej. "tacos de guisado", "hamburguesa", "papas", "quesadilla de queso").
- Extrae los precios unitarios exactos mencionados.
- Si dice algo como "Vendo tacos de guisado a 13 pesos", el producto es "tacos de guisado" y el precio es 13.
- Si no se especifica el precio de algún producto, usa un precio razonable o no lo registres si es ambiguo.
- Si el usuario menciona múltiples productos (ej: "vendo hamburguesas a 45 y papas a 25"), extrae cada uno como un elemento individual.

Llama a la herramienta configurar_productos con la lista de productos y precios extraídos."""

TOOLS_CONFIGURACION = [
    {
        "type": "function",
        "function": {
            "name": "configurar_productos",
            "description": "Registra la lista de productos del negocio con sus respectivos precios unitarios.",
            "parameters": {
                "type": "object",
                "properties": {
                    "productos": {
                        "type": "array",
                        "description": "Lista de productos y precios extraídos de la configuración.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "producto": {"type": "string", "description": "Nombre del producto o categoría general (e.g. tacos de guisado, hamburguesa, papas)"},
                                "precio": {"type": "number", "description": "Precio unitario de venta"}
                            },
                            "required": ["producto", "precio"]
                        }
                    }
                },
                "required": ["productos"]
            }
        }
    }
]

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "registrar_dia_completo",
            "description": "Registra todos los datos financieros y de inventario del día extraídos de la transcripción.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ventas": {
                        "type": "array",
                        "description": "Lista de ventas registradas. Consulta precios unitarios en el menú de referencia.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "producto": {"type": "string", "description": "Nombre del producto vendido (e.g. rajas con queso, picadillo, mole)"},
                                "cantidad": {"type": "integer", "description": "Cantidad vendida, estimada si no es exacta"},
                                "precio_unitario": {"type": "number", "description": "Precio unitario del producto del menú de referencia"},
                                "es_estimado": {"type": "boolean", "description": "true si la cantidad es una estimación, false si es exacta"}
                            },
                            "required": ["producto", "cantidad", "precio_unitario", "es_estimado"]
                        }
                    },
                    "gastos": {
                        "type": "array",
                        "description": "Lista de gastos del negocio registrados.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "concepto": {"type": "string", "description": "Concepto del gasto (ej. gas, tortillas, bolsas, transporte)"},
                                "monto": {"type": "number", "description": "Monto de dinero gastado"}
                            },
                            "required": ["concepto", "monto"]
                        }
                    },
                    "notas_inventario": {
                        "type": "array",
                        "description": "Lista de notas de inventario sobre sobrantes o faltantes.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "producto": {"type": "string", "description": "Nombre del guisado o producto"},
                                "tipo": {"type": "string", "enum": ["sobrante", "se_acabo"], "description": "tipo de nota de inventario"},
                                "cantidad_aproximada": {"type": "string", "description": "Cantidad aproximada descrita (ej. 'como 15', 'todo', 'poquito')"}
                            },
                            "required": ["producto", "tipo", "cantidad_aproximada"]
                        }
                    }
                },
                "required": ["ventas", "gastos", "notas_inventario"]
            }
        }
    }
]

# -------------------------------------------------------------
# Database Initialization & Management
# -------------------------------------------------------------

def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = get_db()
    con.executescript("""
    CREATE TABLE IF NOT EXISTS dias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL UNIQUE,          -- YYYY-MM-DD
        transcripcion TEXT NOT NULL,
        ganancia_dia REAL NOT NULL,
        resumen_narrado TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia_id INTEGER REFERENCES dias(id) ON DELETE CASCADE,
        producto TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        es_estimado INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia_id INTEGER REFERENCES dias(id) ON DELETE CASCADE,
        concepto TEXT NOT NULL,
        monto REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notas_inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia_id INTEGER REFERENCES dias(id) ON DELETE CASCADE,
        producto TEXT NOT NULL,
        tipo TEXT NOT NULL,
        cantidad_aproximada TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS menu (
        producto TEXT PRIMARY KEY,
        precio REAL NOT NULL
    );
    """)
    # Seed default menu items if table is empty
    cur = con.cursor()
    cur.execute("SELECT COUNT(*) FROM menu")
    if cur.fetchone()[0] == 0:
        for prod, price in MENU_REFERENCIA.items():
            cur.execute("INSERT INTO menu (producto, precio) VALUES (?, ?)", (prod, price))
    con.commit()
    con.close()

init_db()

def obtener_menu_referencia() -> dict:
    con = get_db()
    cursor = con.cursor()
    cursor.execute("SELECT producto, precio FROM menu")
    rows = cursor.fetchall()
    con.close()
    if not rows:
        return MENU_REFERENCIA
    return {row["producto"]: row["precio"] for row in rows}

# -------------------------------------------------------------
# Whisper Transcription Lazy Loader
# -------------------------------------------------------------

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        print("Cargando modelo faster-whisper (base)...")
        # Use CPU with int8 quantization to optimize runtime and CPU resource usage
        _whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    return _whisper_model

# -------------------------------------------------------------
# Ollama helper
# -------------------------------------------------------------

def llamar_gemma(messages, tools=None):
    client = ollama.Client(host=OLLAMA_HOST)
    return client.chat(
        model=MODELO,
        messages=messages,
        tools=tools,
        think=False,
        options={
            "temperature": 0.2,
            "num_ctx": 4096,
            "num_predict": 512
        }
    )

# -------------------------------------------------------------
# Capas implementation
# -------------------------------------------------------------

# Capa 1 — Transcripción
def transcribir_archivo(ruta_audio: str) -> str:
    model = get_whisper_model()
    segments, info = model.transcribe(ruta_audio, beam_size=5, language="es")
    transcripcion = "".join(segment.text for segment in segments)
    return transcripcion.strip()

# Capa 2 — Extracción estructurada via function calling (Ollama SDK)
def extraer_registros(transcripcion: str) -> dict:
    menu_actual = obtener_menu_referencia()
    prompt_contenido = (
        f"MENÚ DE REFERENCIA: {json.dumps(menu_actual, ensure_ascii=False)}\n\n"
        f"TRANSCRIPCIÓN DEL DÍA:\n{transcripcion}"
    )
    
    r = llamar_gemma(
        messages=[
            {"role": "system", "content": SYSTEM_EXTRACCION},
            {"role": "user", "content": prompt_contenido}
        ],
        tools=TOOLS
    )
    
    message = r.get("message") or {}
    calls = message.get("tool_calls") or []
    
    ventas, gastos, notas = [], [], []
    
    # Process native tool calls
    if calls:
        for c in calls:
            func = c.get("function") or {}
            nombre = func.get("name")
            args = func.get("arguments") or {}
            
            # Ollama SDK might parse arguments as a dict already, or as a JSON string.
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except Exception:
                    continue
            
            if nombre == "registrar_dia_completo":
                ventas.extend(args.get("ventas") or [])
                gastos.extend(args.get("gastos") or [])
                notas.extend(args.get("notas_inventario") or [])
    else:
        content = message.get("content") or ""
        print("No se detectaron tool_calls nativas. Intentando parsear contenido:", content)
            
    return {"ventas": ventas, "gastos": gastos, "notas_inventario": notas}

# Capa 3 — Consolidación (determinista en Python, NUNCA en el modelo)
def consolidar_registros(registros: dict) -> dict:
    total_ventas = 0.0
    for v in registros["ventas"]:
        cantidad = float(v.get("cantidad", 0))
        precio = float(v.get("precio_unitario", 0))
        total_ventas += cantidad * precio
        
    total_gastos = 0.0
    for g in registros["gastos"]:
        total_gastos += float(g.get("monto", 0))
        
    return {
        "total_ventas": round(total_ventas, 2),
        "total_gastos": round(total_gastos, 2),
        "ganancia_dia": round(total_ventas - total_gastos, 2)
    }

# Capa 4 — Resumen narrado del día
def narrar_resumen(consolidado: dict, registros: dict, dia_anterior: dict = None) -> str:
    contexto_previo = ""
    if dia_anterior:
        contexto_previo = f"\n\nDÍA ANTERIOR: Ganancia neta de ${dia_anterior['ganancia_dia']} pesos."
        
    contenido = (
        f"CONSOLIDADO: {json.dumps(consolidado, ensure_ascii=False)}\n"
        f"VENTAS: {json.dumps(registros['ventas'], ensure_ascii=False)}\n"
        f"GASTOS: {json.dumps(registros['gastos'], ensure_ascii=False)}\n"
        f"NOTAS DE INVENTARIO: {json.dumps(registros['notas_inventario'], ensure_ascii=False)}"
        f"{contexto_previo}"
    )
    
    r = llamar_gemma([
        {"role": "system", "content": SYSTEM_RESUMEN_DIARIO},
        {"role": "user", "content": contenido}
    ])
    
    return r["message"]["content"].strip()

# -------------------------------------------------------------
# Database Persistence Helper
# -------------------------------------------------------------

def guardar_dia_en_db(fecha: str, transcripcion: str, ganancia_dia: float, resumen: str, registros: dict):
    con = get_db()
    try:
        # Delete existing entries for this date to support re-recording
        cur = con.cursor()
        # Find if day exists
        cur.execute("SELECT id FROM dias WHERE fecha = ?", (fecha,))
        row = cur.fetchone()
        if row:
            dia_id = row["id"]
            cur.execute("DELETE FROM ventas WHERE dia_id = ?", (dia_id,))
            cur.execute("DELETE FROM gastos WHERE dia_id = ?", (dia_id,))
            cur.execute("DELETE FROM notas_inventario WHERE dia_id = ?", (dia_id,))
            cur.execute("DELETE FROM dias WHERE id = ?", (dia_id,))
            
        # Insert new day
        cur.execute(
            "INSERT INTO dias (fecha, transcripcion, ganancia_dia, resumen_narrado) VALUES (?, ?, ?, ?)",
            (fecha, transcripcion, ganancia_dia, resumen)
        )
        dia_id = cur.lastrowid
        
        # Insert ventas
        for v in registros["ventas"]:
            cur.execute(
                "INSERT INTO ventas (dia_id, producto, cantidad, precio_unitario, es_estimado) VALUES (?, ?, ?, ?, ?)",
                (dia_id, v["producto"], v["cantidad"], v["precio_unitario"], 1 if v.get("es_estimado") else 0)
            )
            
        # Insert gastos
        for g in registros["gastos"]:
            cur.execute(
                "INSERT INTO gastos (dia_id, concepto, monto) VALUES (?, ?, ?)",
                (dia_id, g["concepto"], g["monto"])
            )
            
        # Insert notas_inventario
        for n in registros["notas_inventario"]:
            cur.execute(
                "INSERT INTO notas_inventario (dia_id, producto, tipo, cantidad_aproximada) VALUES (?, ?, ?, ?)",
                (dia_id, n["producto"], n["tipo"], str(n["cantidad_aproximada"]))
            )
            
        con.commit()
    except Exception as e:
        con.rollback()
        raise e
    finally:
        con.close()

# -------------------------------------------------------------
# API Response Schemas
# -------------------------------------------------------------

class RegistroResponse(BaseModel):
    fecha: str
    transcripcion: str
    consolidado: dict
    registros_extraidos: dict
    resumen: str

class LoadDemoRequest(BaseModel):
    fecha: str
    transcripcion: str

class MenuProduct(BaseModel):
    producto: str
    precio: float

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get("/api/menu")
def obtener_menu():
    con = get_db()
    rows = con.execute("SELECT producto, precio FROM menu").fetchall()
    con.close()
    return [{"producto": r["producto"], "precio": r["precio"]} for r in rows]

@app.post("/api/menu")
def guardar_menu(productos: List[MenuProduct]):
    con = get_db()
    try:
        cur = con.cursor()
        cur.execute("DELETE FROM menu")
        for p in productos:
            cur.execute("INSERT INTO menu (producto, precio) VALUES (?, ?)", (p.producto.lower().strip(), p.precio))
        con.commit()
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        con.close()
    return {"status": "Menú actualizado con éxito"}

@app.post("/api/configurar-menu-voz")
def configurar_menu_voz(
    audio: UploadFile = File(None),
    texto_manual: Optional[str] = Form(None)
):
    """
    Endpoint for onboarding/setup.
    Accepts voice audio or manual text describing what the user sells and at what price,
    runs it through Whisper and Gemma to extract products and prices, and returns them
    for confirmation.
    """
    transcripcion = ""
    if audio:
        temp_dir = "temp_audios"
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"temp_menu_{int(datetime.now().timestamp())}_{audio.filename}")
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        try:
            print(f"Transcribiendo archivo de audio de configuración {temp_path}...")
            transcripcion = transcribir_archivo(temp_path)
            print(f"Transcripción de configuración exitosa: '{transcripcion}'")
        except Exception as e:
            print(f"Error al transcribir configuración: {e}")
            raise HTTPException(status_code=500, detail=f"Error al transcribir el audio: {str(e)}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    elif texto_manual:
        transcripcion = texto_manual.strip()
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar un archivo de audio o texto manual para configurar.")

    if not transcripcion:
        raise HTTPException(status_code=400, detail="La transcripción está vacía.")

    # Call Gemma to extract products
    try:
        r = llamar_gemma(
            messages=[
                {"role": "system", "content": SYSTEM_CONFIGURACION_MENU},
                {"role": "user", "content": f"CONFIGURACIÓN DE PRODUCTOS:\n{transcripcion}"}
            ],
            tools=TOOLS_CONFIGURACION
        )
        
        message = r.get("message") or {}
        calls = message.get("tool_calls") or []
        
        productos_extraidos = []
        if calls:
            for c in calls:
                func = c.get("function") or {}
                nombre = func.get("name")
                args = func.get("arguments") or {}
                
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except Exception:
                        continue
                
                if nombre == "configurar_productos":
                    productos_extraidos.extend(args.get("productos") or [])
        else:
            # Fallback if no tool calls are detected
            content = message.get("content") or ""
            print("No se detectaron tool_calls para configuración. Gemma contestó:", content)
            
        return {
            "transcripcion": transcripcion,
            "productos": productos_extraidos
        }
    except Exception as e:
        print(f"Error al extraer productos con Gemma: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar con la inteligencia artificial: {str(e)}")

@app.post("/api/registrar-dia", response_model=RegistroResponse)
def registrar_dia(
    audio: UploadFile = File(None),
    fecha: Optional[str] = Form(None),
    transcripcion_manual: Optional[str] = Form(None)
):
    """
    Main endpoint to register a business day.
    Accepts either an audio file (to transcribe using Whisper) OR manual text transcription (for testing/demo fallback).
    Accepts an optional date string (YYYY-MM-DD), defaulting to today.
    """
    # 1. Determine Date
    if not fecha:
        fecha = date.today().isoformat()
    else:
        try:
            # Validate format YYYY-MM-DD
            datetime.strptime(fecha, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Usar YYYY-MM-DD.")

    # 2. Get Transcription
    transcripcion = ""
    if audio:
        # Save temp file
        temp_dir = "temp_audios"
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"temp_{int(datetime.now().timestamp())}_{audio.filename}")
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        try:
            print(f"Transcribiendo archivo de audio {temp_path}...")
            transcripcion = transcribir_archivo(temp_path)
            print(f"Transcripción exitosa: '{transcripcion}'")
        except Exception as e:
            print(f"Error al transcribir: {e}")
            raise HTTPException(status_code=500, detail=f"Error al transcribir el audio: {str(e)}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    elif transcripcion_manual:
        transcripcion = transcripcion_manual.strip()
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar un archivo de audio o una transcripción manual.")

    if not transcripcion:
        raise HTTPException(status_code=400, detail="La transcripción está vacía. Intente hablar más claro o escriba el texto.")

    # 3. Capa 2: Extracción estructurada
    try:
        registros = extraer_registros(transcripcion)
        print("Registros extraídos:", registros)
    except Exception as e:
        print(f"Error en Capa 2: {e}")
        raise HTTPException(status_code=500, detail=f"Error en extracción estructurada: {str(e)}")

    # 4. Capa 3: Consolidación
    consolidado = consolidar_registros(registros)
    print("Consolidado calculado:", consolidado)

    # 5. Fetch previous day for comparison
    con = get_db()
    cur = con.cursor()
    # Find previous day before the target date
    cur.execute("SELECT ganancia_dia FROM dias WHERE fecha < ? ORDER BY fecha DESC LIMIT 1", (fecha,))
    row = cur.fetchone()
    dia_anterior = {"ganancia_dia": row["ganancia_dia"]} if row else None
    con.close()

    # 6. Capa 4: Narración
    try:
        resumen = narrar_resumen(consolidado, registros, dia_anterior)
        print("Resumen narrado:", resumen)
    except Exception as e:
        print(f"Error en Capa 4: {e}")
        resumen = f"Hoy ganaste ${consolidado['ganancia_dia']}. Tuviste ventas por ${consolidado['total_ventas']} y gastos por ${consolidado['total_gastos']}."

    # 7. Database Persistence
    try:
        guardar_dia_en_db(fecha, transcripcion, consolidado["ganancia_dia"], resumen, registros)
    except Exception as e:
        print(f"Error de base de datos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al guardar registros en base de datos: {str(e)}")

    return RegistroResponse(
        fecha=fecha,
        transcripcion=transcripcion,
        consolidado=consolidado,
        registros_extraidos=registros,
        resumen=resumen
    )

@app.get("/api/insights-semana")
def insights_semana():
    """
    Capa 5: Evaluates database logs for the past 7 days and returns weekly insights.
    """
    con = get_db()
    dias = con.execute("SELECT * FROM dias ORDER BY fecha DESC LIMIT 7").fetchall()
    
    bloque = []
    for d in dias:
        ventas = con.execute("SELECT producto, cantidad, precio_unitario FROM ventas WHERE dia_id=?", (d["id"],)).fetchall()
        gastos = con.execute("SELECT concepto, monto FROM gastos WHERE dia_id=?", (d["id"],)).fetchall()
        notas = con.execute("SELECT producto, tipo, cantidad_aproximada FROM notas_inventario WHERE dia_id=?", (d["id"],)).fetchall()
        
        bloque.append({
            "fecha": d["fecha"],
            "ganancia": d["ganancia_dia"],
            "ventas": [dict(v) for v in ventas],
            "gastos": [dict(g) for g in gastos],
            "notas_inventario": [dict(n) for n in notas]
        })
    con.close()
    
    if not bloque:
        return {
            "insights": "¡Hola! Aún no hay suficientes días registrados en esta libreta. Registra al menos un día para empezar a ver patrones.",
            "dias_analizados": 0
        }
        
    try:
        print(f"Generando insights para {len(bloque)} días de datos...")
        r = llamar_gemma([
            {"role": "system", "content": SYSTEM_INSIGHTS_SEMANALES},
            {"role": "user", "content": f"DATOS DE LA SEMANA:\n{json.dumps(bloque, ensure_ascii=False, indent=2)}"}
        ])
        insights = r["message"]["content"].strip()
    except Exception as e:
        print(f"Error al generar insights: {e}")
        insights = "Tuviste buenas ventas esta semana. Sigue registrando tus días para comparar e identificar patrones de insumos."
        
    return {
        "insights": insights,
        "dias_analizados": len(bloque)
    }

@app.post("/api/cargar-demo")
def cargar_demo(data: List[LoadDemoRequest]):
    """
    Utility endpoint to populate historical transcripts for demoing.
    This runs Capas 2, 3, and 4 on the textual transcripts without needing audio files,
    allowing developers to load Day 1 and Day 2 data instantly.
    """
    resultados = []
    for item in data:
        # Run Capa 2
        registros = extraer_registros(item.transcripcion)
        # Run Capa 3
        consolidado = consolidar_registros(registros)
        
        # Get previous day for comparison
        con = get_db()
        cur = con.cursor()
        cur.execute("SELECT ganancia_dia FROM dias WHERE fecha < ? ORDER BY fecha DESC LIMIT 1", (item.fecha,))
        row = cur.fetchone()
        dia_anterior = {"ganancia_dia": row["ganancia_dia"]} if row else None
        con.close()
        
        # Run Capa 4
        resumen = narrar_resumen(consolidado, registros, dia_anterior)
        
        # Save to DB
        guardar_dia_en_db(item.fecha, item.transcripcion, consolidado["ganancia_dia"], resumen, registros)
        
        resultados.append({
            "fecha": item.fecha,
            "consolidado": consolidado,
            "resumen": resumen
        })
        
    return {"status": "Demo cargado exitosamente", "dias_cargados": resultados}

@app.get("/api/dias-guardados")
def obtener_dias():
    """
    Returns a summary list of all recorded days in the database.
    Useful for displaying history in the UI.
    """
    con = get_db()
    dias = con.execute("SELECT * FROM dias ORDER BY fecha DESC").fetchall()
    
    lista = []
    for d in dias:
        ventas = con.execute("SELECT producto, cantidad, precio_unitario FROM ventas WHERE dia_id=?", (d["id"],)).fetchall()
        gastos = con.execute("SELECT concepto, monto FROM gastos WHERE dia_id=?", (d["id"],)).fetchall()
        notas = con.execute("SELECT producto, tipo, cantidad_aproximada FROM notas_inventario WHERE dia_id=?", (d["id"],)).fetchall()
        
        lista.append({
            "id": d["id"],
            "fecha": d["fecha"],
            "transcripcion": d["transcripcion"],
            "ganancia_dia": d["ganancia_dia"],
            "resumen_narrado": d["resumen_narrado"],
            "ventas": [dict(v) for v in ventas],
            "gastos": [dict(g) for g in gastos],
            "notas_inventario": [dict(n) for n in notas]
        })
    con.close()
    return lista

@app.delete("/api/limpiar-db")
def limpiar_db():
    """
    Utility endpoint to reset the DB for clean demo runs.
    """
    con = get_db()
    con.execute("DELETE FROM ventas")
    con.execute("DELETE FROM gastos")
    con.execute("DELETE FROM notas_inventario")
    con.execute("DELETE FROM dias")
    con.commit()
    con.close()
    return {"status": "Base de datos limpia"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
