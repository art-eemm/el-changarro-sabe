# El Changarro Sabe — Blueprint Completo
### Build with Gemma · GDG CDMX Hackday · Categoría libre

> **Pitch en una línea:** No le pedimos al changarro que aprenda a usar una app de contabilidad. La app aprende a escuchar cómo el changarro ya habla — un audio de 30 segundos al cerrar el día se convierte en registros financieros reales, corriendo local, sin que sus finanzas salgan jamás del teléfono.

---

## 0. Índice

1. [El problema](#1-el-problema)
2. [La solución](#2-la-solución)
3. [Caso de demo: Tacos "El Salto"](#3-caso-de-demo-tacos-el-salto)
4. [Por qué esto y no una app de contabilidad más](#4-por-qué-esto-y-no-una-app-de-contabilidad-más)
5. [Arquitectura técnica](#5-arquitectura-técnica)
6. [Decisión de runtime](#6-decisión-de-runtime-dónde-corre-gemma-4)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Los prompts](#8-los-prompts)
9. [Las tools de function-calling](#9-las-tools-de-function-calling)
10. [Código esqueleto — Backend](#10-código-esqueleto--backend)
11. [Código esqueleto — Frontend](#11-código-esqueleto--frontend)
12. [Dirección de diseño](#12-dirección-de-diseño)
13. [Datos de demo pre-cargados](#13-datos-de-demo-pre-cargados)
14. [Plan de ejecución por horas](#14-plan-de-ejecución-por-horas)
15. [División de trabajo](#15-división-de-trabajo)
16. [Guion del demo](#16-guion-del-demo)
17. [Artículo de Kaggle](#17-artículo-de-kaggle-mapeado-a-la-rúbrica)
18. [Checklist de entregables](#18-checklist-de-entregables)
19. [Riesgos y planes B](#19-riesgos-y-planes-b)
20. [Nota sobre alcance y responsabilidad](#20-nota-sobre-alcance-y-responsabilidad)
21. [Prompt de arranque para Claude Code / Cowork](#21-prompt-de-arranque-para-claude-code--cowork)

---

## 1. El problema

**El dato que abre la presentación:** en México hay más de 4 millones de micronegocios informales — puestos, changarros, tianguis — de los cuales la enorme mayoría **no lleva ningún registro financiero**. No por desorganización: porque llevar Excel, un POS, o cualquier herramienta de "contabilidad para negocios" requiere un tiempo y un lenguaje que no tienen ni les interesa aprender después de un día completo trabajando.

**El costo real de no llevar registro:**
- No saben con certeza si un día "bueno" en ventas fue realmente bueno después de gastos.
- No detectan a tiempo cuándo un producto deja de ser rentable (el guisado que ya casi no se vende pero lo siguen preparando igual).
- **No tienen historial financiero** — y sin historial, no hay acceso a microcréditos formales, así que dependen de prestamistas informales con condiciones mucho peores.

**Por qué las soluciones existentes no funcionan para este público:**
Las apps de contabilidad para pequeños negocios (Alegra, Contpaqi, hasta un Excel simple) asumen que el usuario **va a sentarse a capturar datos**. Eso ya es una barrera de entrada que la mayoría de changarros no va a cruzar, sin importar qué tan simple sea el formulario.

---

## 2. La solución

Una app donde **la única acción del usuario es mandar un audio hablando como ya habla con un amigo o con su familia**, al cerrar el changarro. Todo lo demás — clasificar, estructurar, sumar, detectar patrones — lo hace Gemma 4 detrás de cámaras.

### Flujo de uso

1. Al cerrar el changarro, el dueño **graba un audio de 20-40 segundos**, sin ningún formato ni estructura esperada: *"Pues hoy vendí bien los tacos de guisado, se me acabó el de rajas rapidísimo, me sobraron como 15 de frijol. Gasté 180 en el gas y 40 en bolsas."*
2. Gemma 4 (**voz→texto + function-calling**) extrae del audio: ventas por producto, gastos por concepto, inventario mencionado (sobras, faltantes) — y lo **estructura en registros contables reales** sin que el usuario haga nada de eso conscientemente.
3. La app muestra un resumen del día en el mismo lenguaje coloquial: *"Hoy ganaste aproximadamente $340 después de gastos. El taco de rajas se vendió completo — quizá prepara más mañana."*
4. Con **contexto largo (256K tokens)**, el sistema acumula el historial de la semana/mes completo en cada análisis, sin necesitar una base de datos compleja ni fine-tuning.
5. Cada semana (o bajo demanda), genera un **resumen con insights accionables**: qué día vende más, qué producto se está quedando, tendencia de gasto en insumos — en el mismo tono simple, nunca en jerga contable.
6. **Todo corre local.** Las finanzas reales de un negocio son de los datos más sensibles que existen — nunca deberían depender de un servidor de terceros para que el changarro reciba esta ayuda.

---

## 3. Caso de demo: Tacos "El Salto"

Usamos un puesto de tacos de guisado real como ambientación de todos los prompts, ejemplos y datos de demo — cerca del metro Salto del Agua, CDMX. Esto hace que el demo se sienta específico y creíble en vez de genérico.

**Menú de referencia:**
| Guisado | Precio |
|---|---|
| Rajas con queso | $13 |
| Frijol con chorizo | $13 |
| Picadillo | $14 |
| Mole | $15 |
| Chicharrón en salsa verde | $14 |

**Gastos típicos del negocio:** gas, bolsas, servilletas, tortillas, insumos (pollo, verdura, especias), transporte al mercado.

---

## 4. Por qué esto y no una app de contabilidad más

| App de contabilidad típica | El Changarro Sabe |
|---|---|
| El usuario captura datos en un formulario | El usuario **habla como ya habla**, cero formato |
| Requiere aprender categorías contables | Gemma 4 traduce lenguaje coloquial → categorías, invisible para el usuario |
| Datos financieros en la nube de un tercero | **100% local** — nunca sale del teléfono |
| Reportes en jerga financiera | Insights en el mismo tono coloquial del audio original |
| Requiere constancia y disciplina de captura | 30 segundos de audio al cerrar, ya está |
| Un producto genérico para "cualquier PyME" | Diseñado específicamente para el ritmo y lenguaje del comercio informal mexicano |

**El argumento que cierra cualquier duda del jurado:** nadie va a convencer a un changarro de llenar un Excel todas las noches. Pero un audio de 30 segundos hablando como ya habla — eso sí es realista que lo adopten. La barrera de entrada es la diferencia entre que este producto se use o no.

---

## 5. Arquitectura técnica

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│   🎤 Botón "Grabar mi día" → Audio → Resumen del día → Historial │
│                    → Resumen semanal con insights                │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ POST /api/registrar-dia (audio)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI)                          │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 1 — TRANSCRIPCIÓN                                   │    │
│  │  Gemma 4 (voz → texto)                                    │    │
│  │  IN:  audio del changarro                                 │    │
│  │  OUT: transcripción cruda en español coloquial mexicano   │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 2 — EXTRACCIÓN ESTRUCTURADA                         │    │
│  │  Gemma 4 + function-calling nativo                        │    │
│  │  IN:  transcripción + menú de referencia del negocio      │    │
│  │  OUT: ventas[], gastos[], notas_inventario[]               │    │
│  │  Tools: registrar_venta, registrar_gasto,                  │    │
│  │         registrar_nota_inventario                          │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 3 — CONSOLIDACIÓN DEL DÍA                           │    │
│  │  Determinista (Python, no el modelo)                      │    │
│  │  Suma ventas, resta gastos, calcula ganancia del día       │    │
│  │  → Nunca dejamos que el modelo "haga la cuenta" —          │    │
│  │    el modelo extrae datos, el código aritmético suma       │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 4 — NARRACIÓN DEL RESUMEN DIARIO                    │    │
│  │  Gemma 4 (texto, tono coloquial)                           │    │
│  │  IN:  consolidado del día + historial reciente             │    │
│  │  OUT: resumen en lenguaje simple, 2-3 frases                │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 5 — INSIGHTS SEMANALES (contexto largo)              │    │
│  │  Gemma 4, ventana de contexto con TODOS los días de la     │    │
│  │  semana cargados directamente (sin vector DB — no hace     │    │
│  │  falta con 256K tokens para una semana de un changarro)    │    │
│  │  OUT: patrones, producto más/menos vendido, tendencia      │    │
│  │       de gasto, recomendación accionable                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  ALMACENAMIENTO — SQLite local                             │    │
│  │  Un archivo .db en el dispositivo. Cero servidor externo.  │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────┬──────────────────────────────────────────┘
                           ▼
                ┌────────────────────────┐
                │   GEMMA 4 (E4B) local  │
                │   vía Ollama · sin red │
                └────────────────────────┘
```

### Decisiones de arquitectura que hay que defender frente al jurado

1. **La aritmética la hace Python, no el modelo (Capa 3).** Un LLM sumando dinero real es un riesgo de confiabilidad innecesario cuando sumar es trivial en código. Gemma 4 extrae los números; el código los suma. Esto es un punto fuerte a favor de la seriedad del proyecto — menciónenlo explícitamente en el artículo.
2. **Separar transcripción de extracción (Capas 1 y 2).** Permite depurar cada pieza por separado si algo falla, y usar function-calling con schema estricto sobre texto ya limpio en vez de sobre audio directo.
3. **Contexto largo en vez de base vectorial (Capa 5).** Una semana de resúmenes diarios de un changarro cabe cómodamente en 256K tokens. No hace falta RAG ni embeddings — es una decisión de simplicidad deliberada, apropiada para un negocio pequeño, y evita una pieza más que se puede romper en un día de hackathon.
4. **SQLite local, no un backend en la nube.** Coherente con la tesis del proyecto: los datos financieros nunca salen del dispositivo.

---

## 6. Decisión de runtime: dónde corre Gemma 4

**Estrategia dual**, igual que en los blueprints anteriores del equipo, pero aquí la razón es todavía más central al pitch: si los datos financieros del changarro no se quedan local, se cae la tesis completa del proyecto.

### Para el demo en vivo → **Ollama local**

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gemma4:e4b     # confirmar tag exacto — necesita soporte de audio
ollama pull gemma4:e2b     # respaldo si la laptop sufre
```

⚠️ **Prueben la transcripción de audio con grabaciones reales antes de llegar** — incluyendo con ruido de fondo (idealmente grabado en la calle, cerca de tráfico, para simular las condiciones reales de un puesto callejero). Si Gemma 4 en su despliegue local no maneja bien audio directamente, el plan B está en la sección 19.

### Para el entregable público → **Kaggle Notebook**

Debe incluir **2-3 audios de ejemplo pre-grabados** (el equipo grabándose a sí mismos simulando el cierre del changarro) que reproduzcan el loop completo transcripción → extracción → consolidado → resumen, para que cualquier juez lo corra sin depender de micrófono ni de condiciones en vivo.

---

## 7. Modelo de datos

```python
# Esquema SQLite — simple a propósito, apropiado para un MVP de un día

"""
CREATE TABLE dias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,               -- YYYY-MM-DD
    transcripcion TEXT NOT NULL,       -- audio crudo transcrito
    ganancia_dia REAL NOT NULL,        -- calculado, nunca por el modelo
    resumen_narrado TEXT NOT NULL      -- texto generado por Capa 4
);

CREATE TABLE ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_id INTEGER REFERENCES dias(id),
    producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL
);

CREATE TABLE gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_id INTEGER REFERENCES dias(id),
    concepto TEXT NOT NULL,
    monto REAL NOT NULL
);

CREATE TABLE notas_inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_id INTEGER REFERENCES dias(id),
    producto TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('sobrante', 'se_acabo')) NOT NULL,
    cantidad_aproximada TEXT            -- texto libre: "como 15", "todo"
);
"""
```

---

## 8. Los prompts

### 8.1 Prompt de transcripción (Capa 1)

Si Gemma 4 recibe audio directamente, este paso es implícito en la llamada multimodal. Si el runtime local no soporta audio de forma confiable, este es el prompt de respaldo para un modelo de transcripción ligero + Gemma 4 limpiando el texto:

```python
SYSTEM_LIMPIEZA_TRANSCRIPCION = """Recibes una transcripción automática de audio que \
puede tener errores de reconocimiento de voz. Tu tarea es corregir SOLO errores \
obvios de transcripción (palabras que no tienen sentido en contexto de un negocio de \
comida), sin cambiar el sentido ni el tono coloquial del hablante. No agregues \
información. No cambies números que sí tengan sentido.

Responde solo con el texto corregido, sin comentarios."""
```

### 8.2 Prompt de extracción estructurada (Capa 2)

```python
SYSTEM_EXTRACCION = """Eres un asistente que ayuda a un changarro de comida a llevar \
registro de su día, a partir de cómo la persona habla naturalmente — nunca le pidas \
que hable distinto.

Recibes la transcripción del día y el menú de referencia del negocio.

Tu tarea es extraer TRES tipos de información usando las herramientas disponibles:

1. VENTAS — cualquier mención de haber vendido algo. Si la persona no dice cantidad \
   exacta ("se vendió bien el de rajas"), usa tu mejor estimación basada en el \
   contexto y en frases como "se acabó" (asume que se vendió toda la producción \
   típica) o "vendí bien" (estimación conservadora, no inventes un número exacto \
   si no hay ninguna pista).

2. GASTOS — cualquier mención de dinero gastado, en insumos, transporte, servicios.

3. NOTAS DE INVENTARIO — sobras o faltantes mencionados, útiles para el resumen \
   semanal aunque no tengan impacto monetario directo ese día.

Reglas:
- Usa el menú de referencia para obtener el precio unitario de cada producto vendido.
- Si la persona menciona una cantidad aproximada ("como 15"), regístrala como texto \
  libre en notas_inventario, no inventes precisión que no existe.
- Si algo es ambiguo entre venta y gasto, prioriza el contexto: "compré tortillas" \
  es gasto; "vendí tacos" es venta.
- No inventes ventas o gastos que no se mencionaron.

Debes llamar las herramientas correspondientes por cada ítem identificado — puedes \
llamar varias veces la misma herramienta para distintos ítems del mismo día."""
```

### 8.3 Prompt de narración del resumen diario (Capa 4)

```python
SYSTEM_RESUMEN_DIARIO = """Eres un asistente que le resume su día a un changarro de \
comida, en el mismo tono en el que él mismo habla — nunca en jerga financiera o \
contable. Nada de "utilidad neta" ni "flujo de caja". Habla como hablaría un amigo \
que le ayuda a llevar cuentas.

Recibes: el consolidado del día (ventas, gastos, ganancia ya calculada) y, si existe, \
el resumen del día anterior para poder comparar.

Tu tarea:
1. Menciona la ganancia del día de forma directa y clara.
2. Si algo destaca (un producto que se vendió muy bien o muy mal, un gasto inusual), \
   menciónalo en una frase.
3. Si hay comparación con el día anterior y es relevante, inclúyela brevemente.

Máximo 3 frases. Cálido, directo, cero condescendencia — esta persona sabe de su \
negocio más que nadie, solo le estás ayudando a verlo más claro."""
```

### 8.4 Prompt de insights semanales (Capa 5, contexto largo)

```python
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
  específica a lo que ves en los datos ("el chicharrón se quedó sobrante 3 de 5 \
  días — considera preparar menos cantidad").

Tono coloquial, directo, como un amigo que lleva las cuentas contigo. Máximo 5 \
frases totales. Nunca uses jerga financiera."""
```

---

## 9. Las tools de function-calling

```python
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "registrar_venta",
            "description": "Registra una venta mencionada en el audio del día. Usa "
                           "el menú de referencia para el precio unitario.",
            "parameters": {
                "type": "object",
                "properties": {
                    "producto": {"type": "string"},
                    "cantidad": {"type": "integer", "description": "Cantidad vendida, estimada si no es exacta"},
                    "precio_unitario": {"type": "number"},
                    "es_estimado": {"type": "boolean", "description": "true si la cantidad es una estimación, no un número exacto dicho por la persona"}
                },
                "required": ["producto", "cantidad", "precio_unitario", "es_estimado"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_gasto",
            "description": "Registra un gasto del negocio mencionado en el audio.",
            "parameters": {
                "type": "object",
                "properties": {
                    "concepto": {"type": "string", "description": "ej. gas, bolsas, tortillas, transporte"},
                    "monto": {"type": "number"}
                },
                "required": ["concepto", "monto"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_nota_inventario",
            "description": "Registra una mención de sobrante o faltante de un producto, "
                           "útil para detectar patrones semanales aunque no tenga "
                           "impacto monetario directo ese día.",
            "parameters": {
                "type": "object",
                "properties": {
                    "producto": {"type": "string"},
                    "tipo": {"type": "string", "enum": ["sobrante", "se_acabo"]},
                    "cantidad_aproximada": {"type": "string", "description": "texto libre, ej. 'como 15', 'todo', 'poquito'"}
                },
                "required": ["producto", "tipo", "cantidad_aproximada"]
            }
        }
    }
]
```

---

## 10. Código esqueleto — Backend

```python
# main.py
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
import ollama, json, base64, sqlite3

app = FastAPI(title="El Changarro Sabe")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODELO = "gemma4:e4b"
DB_PATH = "changarro.db"

MENU_REFERENCIA = {
    "rajas con queso": 13, "frijol con chorizo": 13,
    "picadillo": 14, "mole": 15, "chicharrón en salsa verde": 14,
}

# ─────────────────────────────────────────────────────────────
# Base de datos
# ─────────────────────────────────────────────────────────────

def init_db():
    con = sqlite3.connect(DB_PATH)
    con.executescript("""
    CREATE TABLE IF NOT EXISTS dias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL UNIQUE,
        transcripcion TEXT NOT NULL,
        ganancia_dia REAL NOT NULL,
        resumen_narrado TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia_id INTEGER REFERENCES dias(id),
        producto TEXT NOT NULL, cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL, es_estimado INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia_id INTEGER REFERENCES dias(id),
        concepto TEXT NOT NULL, monto REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notas_inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia_id INTEGER REFERENCES dias(id),
        producto TEXT NOT NULL, tipo TEXT NOT NULL, cantidad_aproximada TEXT NOT NULL
    );
    """)
    con.commit()
    con.close()

init_db()

# ─────────────────────────────────────────────────────────────
# Abstracción del modelo
# ─────────────────────────────────────────────────────────────

def llamar_gemma(messages, tools=None, audio_b64=None):
    if audio_b64:
        messages[-1]["audio"] = audio_b64   # ajustar según soporte real de audio en Ollama
    return ollama.chat(model=MODELO, messages=messages, tools=tools,
                       options={"temperature": 0.2})

def parsear_json(texto: str) -> dict:
    limpio = texto.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(limpio)

# ─────────────────────────────────────────────────────────────
# CAPA 1 — Transcripción
# ─────────────────────────────────────────────────────────────

def transcribir(audio_b64: str) -> str:
    r = llamar_gemma(
        messages=[{"role": "system",
                   "content": "Transcribe este audio en español mexicano coloquial, tal cual se dice."},
                  {"role": "user", "content": "Transcribe el audio."}],
        audio_b64=audio_b64,
    )
    return r["message"]["content"].strip()

# ─────────────────────────────────────────────────────────────
# CAPA 2 — Extracción estructurada vía function-calling
# ─────────────────────────────────────────────────────────────

def extraer_registros(transcripcion: str) -> dict:
    r = llamar_gemma(
        messages=[{"role": "system", "content": SYSTEM_EXTRACCION},
                  {"role": "user", "content":
                      f"MENÚ DE REFERENCIA: {json.dumps(MENU_REFERENCIA, ensure_ascii=False)}\n\n"
                      f"TRANSCRIPCIÓN DEL DÍA:\n{transcripcion}"}],
        tools=TOOLS,
    )
    calls = r["message"].get("tool_calls") or []
    ventas, gastos, notas = [], [], []
    for c in calls:
        nombre, args = c["function"]["name"], c["function"]["arguments"]
        if nombre == "registrar_venta": ventas.append(args)
        elif nombre == "registrar_gasto": gastos.append(args)
        elif nombre == "registrar_nota_inventario": notas.append(args)
    return {"ventas": ventas, "gastos": gastos, "notas_inventario": notas}

# ─────────────────────────────────────────────────────────────
# CAPA 3 — Consolidación (determinista, NUNCA el modelo)
# ─────────────────────────────────────────────────────────────

def consolidar(registros: dict) -> dict:
    total_ventas = sum(v["cantidad"] * v["precio_unitario"] for v in registros["ventas"])
    total_gastos = sum(g["monto"] for g in registros["gastos"])
    return {
        "total_ventas": round(total_ventas, 2),
        "total_gastos": round(total_gastos, 2),
        "ganancia_dia": round(total_ventas - total_gastos, 2),
    }

# ─────────────────────────────────────────────────────────────
# CAPA 4 — Resumen narrado del día
# ─────────────────────────────────────────────────────────────

def narrar_resumen(consolidado: dict, registros: dict, dia_anterior: dict | None) -> str:
    contexto_previo = ""
    if dia_anterior:
        contexto_previo = f"\n\nDÍA ANTERIOR: ganancia de ${dia_anterior['ganancia_dia']}"

    r = llamar_gemma(messages=[
        {"role": "system", "content": SYSTEM_RESUMEN_DIARIO},
        {"role": "user", "content":
            f"CONSOLIDADO: {json.dumps(consolidado, ensure_ascii=False)}\n"
            f"VENTAS: {json.dumps(registros['ventas'], ensure_ascii=False)}\n"
            f"NOTAS: {json.dumps(registros['notas_inventario'], ensure_ascii=False)}"
            f"{contexto_previo}"},
    ])
    return r["message"]["content"].strip()

# ─────────────────────────────────────────────────────────────
# Endpoint principal
# ─────────────────────────────────────────────────────────────

class RegistroDiaResponse(BaseModel):
    fecha: str
    transcripcion: str
    consolidado: dict
    resumen: str

@app.post("/api/registrar-dia", response_model=RegistroDiaResponse)
async def registrar_dia(audio: UploadFile):
    audio_b64 = base64.b64encode(await audio.read()).decode()

    transcripcion = transcribir(audio_b64)
    registros = extraer_registros(transcripcion)
    consolidado = consolidar(registros)

    con = sqlite3.connect(DB_PATH)
    cur = con.execute("SELECT fecha, ganancia_dia FROM dias ORDER BY fecha DESC LIMIT 1")
    fila = cur.fetchone()
    dia_anterior = {"ganancia_dia": fila[1]} if fila else None

    resumen = narrar_resumen(consolidado, registros, dia_anterior)

    hoy = date.today().isoformat()
    cur = con.execute(
        "INSERT INTO dias (fecha, transcripcion, ganancia_dia, resumen_narrado) VALUES (?,?,?,?)",
        (hoy, transcripcion, consolidado["ganancia_dia"], resumen))
    dia_id = cur.lastrowid

    for v in registros["ventas"]:
        con.execute("INSERT INTO ventas (dia_id, producto, cantidad, precio_unitario, es_estimado) VALUES (?,?,?,?,?)",
                    (dia_id, v["producto"], v["cantidad"], v["precio_unitario"], int(v["es_estimado"])))
    for g in registros["gastos"]:
        con.execute("INSERT INTO gastos (dia_id, concepto, monto) VALUES (?,?,?)",
                    (dia_id, g["concepto"], g["monto"]))
    for n in registros["notas_inventario"]:
        con.execute("INSERT INTO notas_inventario (dia_id, producto, tipo, cantidad_aproximada) VALUES (?,?,?,?)",
                    (dia_id, n["producto"], n["tipo"], n["cantidad_aproximada"]))
    con.commit()
    con.close()

    return RegistroDiaResponse(fecha=hoy, transcripcion=transcripcion,
                               consolidado=consolidado, resumen=resumen)

# ─────────────────────────────────────────────────────────────
# CAPA 5 — Insights semanales (contexto largo)
# ─────────────────────────────────────────────────────────────

@app.get("/api/insights-semana")
def insights_semana():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    dias = con.execute("SELECT * FROM dias ORDER BY fecha DESC LIMIT 7").fetchall()

    bloque = []
    for d in dias:
        ventas = con.execute("SELECT producto, cantidad, precio_unitario FROM ventas WHERE dia_id=?", (d["id"],)).fetchall()
        gastos = con.execute("SELECT concepto, monto FROM gastos WHERE dia_id=?", (d["id"],)).fetchall()
        notas = con.execute("SELECT producto, tipo, cantidad_aproximada FROM notas_inventario WHERE dia_id=?", (d["id"],)).fetchall()
        bloque.append({
            "fecha": d["fecha"], "ganancia": d["ganancia_dia"],
            "ventas": [dict(v) for v in ventas],
            "gastos": [dict(g) for g in gastos],
            "notas_inventario": [dict(n) for n in notas],
        })
    con.close()

    if not bloque:
        return {"insights": "Aún no hay suficientes días registrados para ver patrones."}

    r = llamar_gemma(messages=[
        {"role": "system", "content": SYSTEM_INSIGHTS_SEMANALES},
        {"role": "user", "content": f"DATOS DE LA SEMANA:\n{json.dumps(bloque, ensure_ascii=False, indent=2)}"},
    ])
    return {"insights": r["message"]["content"].strip(), "dias_analizados": len(bloque)}
```

---

## 11. Código esqueleto — Frontend

```jsx
// App.jsx
import { useState, useRef } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [fase, setFase] = useState("inicio"); // inicio | grabando | procesando | resumen
  const [resultado, setResultado] = useState(null);
  const [insights, setInsights] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  async function iniciarGrabacion() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.onstop = enviarAudio;
    mediaRecorder.current.start();
    setFase("grabando");
  }

  function detenerGrabacion() {
    mediaRecorder.current.stop();
  }

  async function enviarAudio() {
    setFase("procesando");
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    const form = new FormData();
    form.append("audio", blob, "dia.webm");

    const res = await fetch(`${API}/api/registrar-dia`, { method: "POST", body: form });
    const data = await res.json();
    setResultado(data);
    setFase("resumen");
  }

  async function verInsightsSemana() {
    const res = await fetch(`${API}/api/insights-semana`);
    const data = await res.json();
    setInsights(data.insights);
  }

  return (
    <main className="app">
      <header>
        <h1>El Changarro Sabe</h1>
        <p className="tagline">Cuéntame cómo te fue hoy — yo llevo las cuentas.</p>
      </header>

      {fase === "inicio" && (
        <button className="boton-grabar" onClick={iniciarGrabacion}>
          🎤 Contar mi día
        </button>
      )}

      {fase === "grabando" && (
        <div className="grabando">
          <div className="onda-pulso" />
          <button onClick={detenerGrabacion}>Ya terminé</button>
        </div>
      )}

      {fase === "procesando" && <div className="procesando">Sacando cuentas…</div>}

      {fase === "resumen" && resultado && (
        <div className="tarjeta-resumen">
          <span className="ganancia">${resultado.consolidado.ganancia_dia}</span>
          <p className="resumen-texto">{resultado.resumen}</p>
          <details>
            <summary>Lo que escuché</summary>
            <p className="transcripcion">"{resultado.transcripcion}"</p>
          </details>
          <button onClick={verInsightsSemana}>Ver mi semana</button>
          {insights && <p className="insights">{insights}</p>}
        </div>
      )}
    </main>
  );
}
```

---

## 12. Dirección de diseño

**Concepto:** cálido, directo, cero estética de "app fintech corporativa". Piensen en la libreta de cuentas de una fonda familiar — papel, tinta, números escritos a mano — pero limpio y moderno.

```css
:root {
  --masa:    #F7EFE3;
  --tinta:   #2C231B;
  --guiso:   #C0432E;     /* rojo guisado, el color de acento */
  --verde:   #4F7942;     /* ganancia positiva */
  --suave:   #8A7B6A;

  --fuente-display: "Fraunces", Georgia, serif;
  --fuente-texto:   "Karla", sans-serif;
}

.app {
  background: var(--masa);
  color: var(--tinta);
  font-family: var(--fuente-texto);
  max-width: 28rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  min-height: 100vh;
}

h1 {
  font-family: var(--fuente-display);
  font-weight: 700;
  font-size: 1.8rem;
}
.tagline { color: var(--suave); font-size: .95rem; }

.boton-grabar {
  width: 100%;
  padding: 2rem;
  font-family: var(--fuente-display);
  font-size: 1.3rem;
  background: var(--guiso);
  color: var(--masa);
  border: none;
  border-radius: 20px;
  box-shadow: 0 6px 0 #8a2e1e;
  margin-top: 2rem;
}
.boton-grabar:active { transform: translateY(4px); box-shadow: 0 2px 0 #8a2e1e; }

.onda-pulso {
  width: 5rem; height: 5rem; margin: 2rem auto;
  border-radius: 50%; background: var(--guiso);
  animation: pulso 1.2s ease-in-out infinite;
}
@keyframes pulso { 0%,100% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.25); opacity: 1; } }

.tarjeta-resumen {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
}
.ganancia {
  font-family: var(--fuente-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--verde);
  display: block;
}
.resumen-texto { margin-top: .75rem; line-height: 1.6; }
.transcripcion { font-style: italic; color: var(--suave); }
.insights {
  margin-top: 1rem; padding: 1rem;
  background: var(--masa); border-radius: 12px;
  border-left: 3px solid var(--guiso);
}
```

**Fuentes:** Fraunces + Karla — mismas que en los proyectos anteriores del equipo, así que ya tienen el setup listo si las descargaron antes.

---

## 13. Datos de demo pre-cargados

Guarden estos audios grabados de antemano (el equipo mismo actuando, en distintas voces si pueden) para no depender de grabar en vivo frente al jurado si el momento no sale bien:

**Día 1 (lunes):**
> *"Pues hoy estuvo tranquilo, vendí como 20 de rajas y 15 de frijol, el mole casi no se movió, me sobraron como 8. Gasté 180 en gas y 50 en tortillas."*

**Día 2 (martes):**
> *"Hoy sí estuvo bueno, se me acabó todo el picadillo bien rápido, tuve que hacer más rajas a medio día porque también se acabaron. El chicharrón otra vez me sobró harto. Gasté 200 en insumos y 40 en bolsas."*

**Día 3 (miércoles) — el que usan en vivo:**
> *"Hoy vendí bien los tacos de guisado, se me acabó rapidísimo el de rajas, como siempre. Del de frijol me sobraron unos 15. Gasté 180 en el gas y 40 en bolsas."*

Con estos 3 días cargados de antemano, el botón "Ver mi semana" ya tiene suficiente contexto para mostrar un insight real y específico en el demo (ej. "las rajas se venden consistente, el chicharrón se está quedando — considera preparar menos").

---

## 14. Plan de ejecución por horas

| Hora | Objetivo | Quién |
|---|---|---|
| **Antes de llegar** | Ollama + `gemma4:e4b` probado con audio real grabado en condiciones ruidosas. Los 3 audios de demo grabados. Repo y Vite listos. | Todos, en casa |
| 09:00–09:45 | Registro, kickoff, formación de equipo | Todos |
| 09:45–10:15 | Alineación, repartir tareas | Todos |
| 10:15–12:00 | **Capas 1+2** — transcripción + extracción funcionando con los 3 audios de demo | ML + Backend |
| 10:15–12:00 | UI de grabación + tarjeta de resumen (con datos falsos) | Frontend + Diseño |
| 12:00–13:30 | **Capas 3+4** — consolidado determinista + narración del resumen diario | Backend |
| 12:00–13:30 | Conectar frontend al backend real | Frontend |
| 13:30–14:15 | Comida + congelar alcance | Todos |
| 14:15–15:30 | **Capa 5** — insights semanales con los 3 días pre-cargados | ML + Backend |
| 14:15–15:30 | Pulido visual, estados de carga, responsive, Kaggle Notebook | Frontend + Diseño + Backend |
| **15:30** | 🚨 **FEATURE FREEZE** | Todos |
| 15:30–16:30 | Ensayar el demo 3 veces con el mismo audio | Todos |
| 16:30–17:30 | Artículo de Kaggle + repo público | 2 personas |
| 17:30–17:45 | **ENVIAR** | Uno designado |
| 17:45–18:00 | Presentación | Todos |

---

## 15. División de trabajo

**Persona 1 — ML / Python:** prompts de las 5 capas, ajuste fino de extracción hasta que sea confiable con los 3 audios de demo. Es el rol crítico — si la extracción falla, no hay proyecto.

**Persona 2 — Backend / APIs:** FastAPI, SQLite, consolidación determinista, Kaggle Notebook.

**Persona 3 — Frontend:** grabación de audio en navegador, estados de carga, tarjeta de resumen.

**Persona 4 — Diseño:** sistema visual "libreta de fonda", y dueño del guion + slides desde temprano.

**Persona 5 (si aplica):** QA — probar la extracción con 10+ variaciones de cómo alguien podría hablar de su día, para encontrar dónde se rompe el prompt antes que el jurado.

---

## 16. Guion del demo

**0:00–0:30 — El gancho**
> "Más de 4 millones de changarros en México no llevan ningún registro de sus finanzas. No por desorganizados — porque ninguna app de contabilidad está diseñada para alguien que acaba de cerrar su puesto después de 10 horas de pie."

**0:30–1:00 — La tesis**
> "No le pedimos que aprenda una app nueva. La app aprende a escuchar cómo él ya habla."

**1:00–3:00 — El demo en vivo**
1. Presionan grabar y dicen en voz alta (o reproducen el audio pre-grabado del Día 3): *"Hoy vendí bien los tacos de guisado, se me acabó rapidísimo el de rajas..."*
2. La app muestra el resumen: ganancia del día, en lenguaje simple.
3. Abren "lo que escuché" para mostrar la transcripción cruda — que el jurado vea que no hubo trampa, viene del audio real.
4. Presionan "Ver mi semana" — con los 3 días pre-cargados, sale un insight específico y accionable.

**3:00–3:45 — El cierre técnico**
> "Cinco capas de Gemma 4: transcribe el audio, extrae ventas y gastos con function-calling, y — esto es importante — la suma la hace nuestro código, no el modelo. Nunca dejamos que un LLM sume dinero real. Con 256K de contexto, analizamos la semana completa sin necesitar una base de datos vectorial. Y todo corre local — las finanzas de este negocio nunca tocan un servidor ajeno."

**3:45–4:00 — El impacto**
> "Esto no es una app de contabilidad más simple. Es la diferencia entre que alguien lleve registro de su negocio, o no lo lleve nunca."

---

## 17. Artículo de Kaggle (mapeado a la rúbrica)

**Título:** El Changarro Sabe: contabilidad que se adapta a cómo ya hablas, no al revés
**Subtítulo:** Un pipeline de voz-a-registro financiero con Gemma 4, corriendo 100% local, diseñado para el comercio informal mexicano

| Sección | Palabras | Qué debe lograr | Rúbrica |
|---|---|---|---|
| El problema | 200 | Los 4 millones de changarros sin registro, y por qué las apps existentes fallan para este público | Innovación e Impacto (30%) |
| La solución y su tesis | 200 | "No le pedimos que aprenda, la app aprende a escuchar" | Innovación (30%) |
| Arquitectura de 5 capas | 300 | Diagrama + la decisión de que la aritmética sea determinista, no del modelo | Integración Gemma (30%) |
| Uso específico de Gemma 4 | 350 | Voz→texto, function-calling con schema estricto, contexto largo en vez de RAG — sean concretos sobre cada decisión y por qué | Integración Gemma (30%) |
| Retos del día | 200 | Honestidad sobre el soporte de audio local, ajustes al prompt de extracción | Presentación (20%) |
| Demo y resultados | 150 | Capturas del flujo con los audios de Tacos "El Salto" | Funcionalidad (20%) |
| Limitaciones y siguiente paso | 100 | Validación con changarros reales, manejo de dialectos regionales, multi-negocio | Presentación (20%) |

**Argumento diferenciador:** dejen explícito en el artículo que **la decisión de que Python sume el dinero y no el modelo** es una decisión de responsabilidad técnica, no una limitación — están tratando datos financieros reales con el cuidado que merecen, y no le piden a un LLM que haga algo en lo que puede fallar sin necesidad.

---

## 18. Checklist de entregables

- [ ] **Artículo de Kaggle** con el botón "Nuevo artículo", máximo 1500 palabras
- [ ] Categoría: ahora libre — seleccionen la que mejor aplique según las opciones actualizadas del formulario de Kaggle
- [ ] **Repo público** (GitHub o Kaggle Notebook) — sin login, sin paywall, bien documentado
- [ ] Enlace al repo en "Adjuntos" → "Enlaces del proyecto"
- [ ] **Demo en vivo** pública — el Kaggle Notebook con los 3 audios pre-cargados es la red de seguridad si el demo en vivo con micrófono no se puede reproducir fuera del venue
- [ ] Enlace a la demo en "Adjuntos"
- [ ] **ENVIADO** con el botón "Enviar" antes de la fecha límite — designen a un responsable

---

## 19. Riesgos y planes B

| Riesgo | Probabilidad | Plan B |
|---|---|---|
| Gemma 4 local no soporta audio de forma confiable | **Media-Alta** | Usar un modelo ligero de transcripción (ej. Whisper local, `faster-whisper` corre bien en CPU) solo para audio→texto, y que Gemma 4 entre desde la Capa 2 en adelante (texto → extracción). Esto NO rompe la tesis de "100% local" — sigue sin tocar la nube. |
| El wifi falla | Alta | Modelo local, ya cubierto |
| La extracción confunde ventas con gastos en casos ambiguos | Media | Afinar el prompt con los 3 audios de demo desde temprano; en el peor caso, el usuario puede corregir manualmente un registro (feature simple de agregar si da tiempo) |
| El ruido de fondo (simulando la calle) arruina la transcripción | Media | Prueben específicamente con ruido antes de llegar; si es un problema real, usen los audios pre-grabados como plan A del demo, no como respaldo |
| No da tiempo la Capa 5 (insights semanales) | Media | El proyecto es completo sin ella — el registro diario ya es la propuesta de valor central. Insights es la capa "de lujo" |
| Se cae todo el demo en vivo | Media | Video grabado de respaldo, hecho a las 16:00 |

---

## 20. Nota sobre alcance y responsabilidad

Para el artículo de Kaggle y para cualquier pregunta del jurado sobre el alcance real del producto:

- Esto es un **asistente de registro**, no un sistema de contabilidad fiscal ni de cumplimiento con el SAT. Déjenlo explícito para no generar expectativas que el prototipo no cubre.
- Los montos son estimaciones basadas en lo que la persona narra — el sistema está diseñado para dar visibilidad, no para ser un libro contable con validez legal.
- La decisión de que la aritmética sea 100% determinista (Capa 3) es la que hace responsable mostrar montos de dinero real, aunque las cantidades vendidas vengan de una extracción por IA — es importante para el jurado ver que entendieron ese límite.

---

## 21. Prompt de arranque para Claude Code / Cowork

Copien y peguen esto como primer mensaje al iniciar el proyecto en Claude Code o Cowork, adjuntando este blueprint completo:

```
Voy a construir "El Changarro Sabe" para un hackathon de un día (Build with Gemma,
GDG CDMX). Adjunto el blueprint completo con arquitectura, prompts, esquema de datos
y código esqueleto ya definidos — quiero que lo uses como especificación, no que
rediseñes el enfoque.

Empecemos por:
1. Scaffolding del proyecto: backend FastAPI + frontend React (Vite), con la
   estructura de carpetas y el esquema SQLite de la sección 7.
2. Implementa primero las Capas 1-3 (transcripción → extracción → consolidación)
   como funciones puras y testeables, usando los 3 audios de demo de la sección 13
   como casos de prueba antes de conectar nada a UI.
3. La Capa 3 (consolidación) debe ser aritmética de Python pura, nunca una llamada
   al modelo — es una decisión de arquitectura no negociable del blueprint.
4. Usa Ollama con gemma4:e4b como cliente del modelo, con la función llamar_gemma()
   abstraída como en el código esqueleto, para poder cambiar fácil a Kaggle después.

Tengo [X horas] antes del feature freeze. Prioriza que el loop completo funcione de
principio a fin con datos reales antes que pulir cualquier parte individual.
```

---

**Suerte. Empiecen probando la transcripción de audio con ruido real antes que nada — si Gemma 4 local no la maneja bien, necesitan saberlo a las 10:30, no a las 15:00.**
