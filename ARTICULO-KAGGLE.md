# El Changarro Sabe: contabilidad que se adapta a cómo ya hablas, no al revés

**Un pipeline de voz-a-registro financiero con Gemma 4, corriendo 100% local, diseñado para el comercio informal mexicano.**

*Categoría: Digital Equity & Inclusion*

---

## El problema no es la contabilidad. Es la barrera de entrada.

En México hay más de **4 millones de micronegocios informales** — puestos de tacos, changarros, tianguis — y la enorme mayoría no lleva ningún registro financiero. Es tentador leer eso como desorganización. No lo es.

Llevar un Excel, un POS o cualquier "app de contabilidad para pequeños negocios" exige dos cosas que esta población no tiene después de diez horas de pie: **tiempo y un lenguaje ajeno**. Alegra, Contpaqi, incluso una hoja de cálculo simple, todas parten del mismo supuesto: que el usuario se va a sentar a capturar datos en un formulario, usando categorías que alguien más definió — "ingreso operativo", "costo de ventas", "flujo de caja".

Esa es la barrera. Y no la cruza un formulario más bonito.

El costo de no cruzarla es concreto. Sin registro, un changarro no sabe si un día "bueno" fue realmente bueno después de gastos. No detecta cuándo un producto dejó de ser rentable. Y, sobre todo, **no construye historial financiero** — sin historial no hay acceso a microcrédito formal, y la única puerta que queda abierta es el prestamista informal, con condiciones mucho peores.

Esto es un problema de equidad digital en su forma más literal: existe una herramienta útil, y una población entera queda fuera porque la herramienta exige hablar un idioma que no es el suyo.

## La tesis

**No le pedimos al changarro que aprenda a usar una app. La app aprende a escuchar cómo el changarro ya habla.**

La única acción del usuario es grabar 30 segundos al cerrar el puesto, sin formato ni estructura:

> *"Hoy vendí bien los tacos de guisado, se me acabó rapidísimo el de rajas, como siempre. Del de frijol me sobraron unos 15. Gasté 180 en el gas y 40 en bolsas."*

De ahí sale, sin que la persona haga nada más: ventas por producto con precios del menú, gastos por concepto, notas de inventario, la ganancia del día, y un resumen devuelto **en el mismo tono en que habló** — nunca en jerga contable.

La inclusión aquí no es una capa de accesibilidad añadida al final. Es la arquitectura: el español coloquial mexicano, con sus "harto", "pos", "se me acabó rapidísimo", **es la interfaz**.

## Arquitectura: cinco capas, y una que deliberadamente no usa el modelo

```
🎤 audio
   ├─ CAPA 1  Transcripción       Gemma 4, audio nativo          ~9 s
   ├─ CAPA 2  Extracción          Gemma 4 + function-calling      ~80 s (CPU)
   ├─ CAPA 3  Consolidación       PYTHON PURO                     0.0000 s
   ├─ CAPA 4  Narración           Gemma 4                        ~15 s
   └─ CAPA 5  Insights semanales  Gemma 4, contexto largo
   💾 SQLite local · 🚫 cero peticiones a internet
```

**Capa 1 — Transcripción.** El audio entra directo a Gemma 4. No hay Whisper ni ningún modelo de transcripción aparte. El prompt le pide explícitamente *no* corregir la gramática ni volver el habla más formal: si la persona dijo "pos", queremos "pos". Sobre grabaciones reales tardó **9.4 s** y devolvió una transcripción casi perfecta.

**Capa 2 — Extracción estructurada.** Aquí entra el function-calling nativo de Gemma 4 con tres herramientas de schema estricto: `registrar_venta`, `registrar_gasto`, `registrar_nota_inventario`. El modelo puede llamarlas varias veces por día. Lo interesante es lo que infiere: de *"se me acabó rapidísimo el de rajas"* produce **a la vez** una venta de 25 piezas marcada `es_estimado: true` y una nota de inventario tipo `se_acabo`. De *"me sobraron unos 15"* produce **sólo** una nota de sobrante — nunca una venta.

**Capa 3 — Consolidación. Cero llamadas al modelo.** Esta es la decisión de arquitectura central del proyecto. Un LLM sumando dinero real es un riesgo de confiabilidad innecesario cuando sumar es trivial en código.

Y fuimos un paso más allá de lo obvio: **el precio unitario tampoco lo pone el modelo**. Aunque `registrar_venta` recibe un `precio_unitario`, el código lo descarta y busca el precio canónico en el menú del negocio. Gemma 4 identifica *qué* se vendió y *cuánto*; el código pone el precio y hace la aritmética. La capa corre en **0.0000 s** y es auditable línea por línea.

**Capa 4 — Narración.** El consolidado vuelve a Gemma 4 para redactarse en tres frases coloquiales, con el día anterior en contexto para comparar. Salida real del sistema:

> *"Hoy cerramos con una ganancia de $105, y me da gusto que las rajas con queso se hayan acabado otra vez. La diferencia con los $210 de ayer es bastante notable."*

**Capa 5 — Insights semanales.** Los 7 días completos se cargan directo en la ventana de contexto. **Sin RAG y sin base vectorial**: una semana de un changarro cabe de sobra en 131K tokens. Montar embeddings aquí sería una pieza más que se puede romper, sin ganancia real. Es una decisión de simplicidad deliberada, apropiada a la escala del problema.

## Dos cosas que descubrimos y que no están documentadas

**El cliente Python de Ollama no soporta audio.** En su versión 0.6.2 — la más reciente — el tipo `Message` sólo tiene `images`. Mandar `audio` o `audios` a `/api/chat` **no da error**: Ollama ignora el campo en silencio, responde HTTP 200, y el modelo contesta *"soy un modelo de lenguaje, no tengo oídos"*. Es el peor tipo de fallo: silencioso y con apariencia de éxito. La única vía que sí entrega el audio a Gemma 4 es el endpoint OpenAI-compatible `/v1/chat/completions` con content-parts `input_audio`.

**El thinking cuesta 18x en CPU, y apagarlo tiene un precio.** Gemma 4 razona en cadena por defecto y el endpoint `/v1` no permite desactivarlo. Medimos la misma extracción: **118 s con thinking, 6.4 s sin él**. Pero sin thinking el modelo dejó de inferir que *"se me acabó el de rajas"* implicaba una venta — sólo extrajo los gastos explícitos.

La conclusión no fue elegir uno, sino hacer el control **por capa**: thinking encendido en la Capa 2, donde la calidad de la inferencia es todo el valor; apagado en las Capas 4 y 5, que sólo redactan. Eso obliga a usar el endpoint nativo, el único que expone `think`. El sistema termina usando **dos endpoints distintos según lo que cada capa necesita**, encapsulados detrás de una sola función `llamar_gemma()`.

Un tercer hallazgo, más mundano pero decisivo: Ollama corría **100% en CPU** porque el paquete instalado no incluía el runtime de CUDA. Diagnosticarlo (`ollama ps` decía `100% CPU`, y `/usr/lib/ollama/` no tenía `libggml-cuda.so`) fue la diferencia entre un demo de dos minutos por día y uno de quince segundos.

## Por qué local no es un detalle

Las finanzas de un negocio son de los datos más sensibles que existen. Si para recibir esta ayuda el changarro tuviera que mandarlas al servidor de un tercero, se cae la premisa entera.

Todo corre en el aparato: Gemma 4 vía Ollama, SQLite como almacenamiento, y un frontend de un solo archivo **sin una sola petición externa** — sin CDN, sin fuentes remotas, sin analytics. Un juez puede abrir la pestaña de red y confirmarlo.

Que Gemma 4 quepa y corra en una laptop es lo que hace esto posible. No es una versión degradada de un producto en la nube: es la única forma en que este producto tiene derecho a existir.

## Alcance y honestidad

Esto es un **asistente de registro**, no un sistema de contabilidad fiscal ni de cumplimiento con el SAT.

La transcripción se equivoca: en nuestras pruebas oyó *"unos cinco"* donde el audio decía *"unos 15"*. Por eso, cuando el modelo estima una cantidad, el registro queda marcado como `es_estimado` y la interfaz lo muestra con una etiqueta visible. Nunca presentamos una estimación como si fuera un dato exacto.

Que la aritmética sea 100% determinista es precisamente lo que hace responsable mostrar montos de dinero real, aun cuando las cantidades vengan de una extracción por IA. Entender ese límite es parte del diseño, no una nota al pie.

**Falta:** validación con changarros reales — los audios de demo somos nosotros actuando; menú configurable por el usuario; dialectos y regionalismos fuera del centro del país; soporte multi-negocio.

## El punto

Esto no es una app de contabilidad más simple. Es la diferencia entre que alguien lleve registro de su negocio, o no lo lleve nunca.

---

*Repo público con el código completo, la app web, los audios de demo y el notebook reproducible.*
