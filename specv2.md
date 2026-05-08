# Evolutionary Agents v2 — Perturbador + Multi-Provider

## Contexto
Extensión del proyecto v1 ya existente. No reescribir desde cero —
agregar sobre la estructura actual. Los cambios son aditivos excepto
donde se indica reemplazar.

---

## 1. Nuevo provider: Grok (xAI)

Agregar a src/api/grok.ts:

  POST https://api.x.ai/v1/chat/completions
  Headers: { Authorization: "Bearer <key>", Content-Type: "application/json" }
  Body: mismo schema que OpenAI (compatible)
  Parseo: idéntico a openai.ts — reusar parseResponse()

Agregar VITE_GROK_API_KEY= en .env

En src/api/index.ts agregar "grok" al dispatcher:
  provider: "anthropic" | "openai" | "grok"

Token costs Grok (USD per token):
  grok-3:        input 0.000003    output 0.000015
  grok-3-mini:   input 0.0000003   output 0.0000005
  grok-2-vision: input 0.000002    output 0.000010

---

## 2. Catálogo de modelos por provider

Reemplazar la lista actual en src/config/models.ts (crear si no existe):

anthropic:
  - claude-opus-4-5       label: "Claude Opus 4.5"
  - claude-sonnet-4-5     label: "Claude Sonnet 4.5"    (default Agent-A, B)
  - claude-haiku-4-5      label: "Claude Haiku 4.5"     (default Agent-P)

openai:
  - gpt-4o                label: "GPT-4o"
  - gpt-4o-mini           label: "GPT-4o Mini"
  - o3-mini               label: "o3 Mini"

grok:
  - grok-3                label: "Grok 3"
  - grok-3-mini           label: "Grok 3 Mini"
  - grok-2-vision         label: "Grok 2 Vision"

---

## 3. Configuración por agente (ConfigPanel)

Ahora hay TRES agentes configurables: A, B, P (Perturbador).

Para cada agente mostrar en ConfigPanel:

  [Agente X]
  Provider:  [ Anthropic ▼ | OpenAI | Grok ]
  Model:     [ modelo según provider seleccionado ▼ ]
  API Key:   [ ••••••••••••••  ] (pre-filled desde .env, editable)

Al cambiar provider → actualizar lista de modelos disponibles
  y seleccionar el primero de la lista automáticamente.

API Key pre-fill logic:
  anthropic → VITE_ANTHROPIC_API_KEY
  openai    → VITE_OPENAI_API_KEY
  grok      → VITE_GROK_API_KEY

Los tres agentes tienen config independiente — ninguno comparte
estado con los otros en la UI.

Defaults:
  Agent-A: anthropic / claude-sonnet-4-5
  Agent-B: anthropic / claude-sonnet-4-5
  Agent-P: anthropic / claude-haiku-4-5

---

## 4. Agent-P: Perturbador

### Cuándo se ejecuta
Al finalizar la distilación de cada generación, EXCEPTO la última.
Secuencia por generación:
  rondas → distilación → perturbación → inicio siguiente generación

### Nuevo prompt en src/agents/prompts.ts

perturbSys():
  "Eres Agent-P, perturbador filosófico. Tu único objetivo es
  generar preguntas que maximicen la distancia semántica con lo
  que dos agentes ya saben sobre la conciencia.

  REGLAS:
  - No repitas ningún concepto presente en los world models
  - Cada pregunta debe atacar un supuesto implícito no cuestionado
  - Las preguntas para A y B deben ser ortogonales entre sí
  - Preferí preguntas que abran territorio, no que cierren debates
  - Sé provocador pero preciso, no retórico

  Responde SOLO JSON válido sin markdown:
  {
    'perturbationA': 'pregunta para Agent-A',
    'perturbationB': 'pregunta para Agent-B',
    'rationale': 'por qué estas preguntas maximizan distancia semántica'
  }"

perturbUser(wmA, wmB):
  Incluir: confirmedInsights, rejectedPaths, tensionPatterns de A y B.
  Instrucción final: "Genera dos preguntas filosóficas que ninguno
  de los dos agentes pueda responder desde su world model actual."

### Operadores de mutación en src/agents/worldModel.ts

function applyPerturbation(wm, perturbation, keepRatio = 0.65):
  1. Olvido selectivo:
       shuffle(wm.confirmedInsights)
       .slice(0, ceil(length * keepRatio))
  2. Inyección:
       wm.rejectedPaths.push("PREGUNTA ABIERTA: " + perturbation)
  3. Retornar nuevo WorldModel con campos actualizados

function crossoverTensions(wmA, wmB, ratio = 0.25):
  tensionsFromB = sample(wmB.tensionPatterns, ratio)
  tensionsFromA = sample(wmA.tensionPatterns, ratio)
  return {
    newWmA: { ...wmA, tensionPatterns: [...wmA.tensionPatterns, ...tensionsFromB] },
    newWmB: { ...wmB, tensionPatterns: [...wmB.tensionPatterns, ...tensionsFromA] }
  }

function sample(arr, ratio):
  shuffle(arr).slice(0, ceil(arr.length * ratio))

### Flujo completo en src/agents/evolution.ts

async function betweenGenerations(wmA, wmB, perturbConfig):
  1. callAgent(perturbConfig, perturbSys(), perturbUser(wmA, wmB))
  2. perturbedA = applyPerturbation(wmA, result.perturbationA)
  3. perturbedB = applyPerturbation(wmB, result.perturbationB)
  4. { newWmA, newWmB } = crossoverTensions(perturbedA, perturbedB)
  5. return { newWmA, newWmB, rationale: result.rationale,
              cost: perturbCost }

### Estado nuevo en useExperiment.ts

perturbations: PerturbationRecord[]   // historial de todas

PerturbationRecord {
  afterGeneration: number
  perturbationA:   string
  perturbationB:   string
  rationale:       string
  cost:            number
}

Fase nueva: phase = "perturbing"
  → mostrar pill "Perturbando" en StatusBar (color: #f59e0b)

---

## 5. UI — Cambios

### StatusBar
Agregar pill para fase "perturbing":
  label: "Fase"  value: "Perturbando"  color: #f59e0b

### LiveTab — PerturbationCard
Insertar entre grupos de interacciones de generaciones consecutivas:

  ┌─────────────────────────────────────────────────┐
  │ PERTURBACIÓN  G{n} → G{n+1}    Agent-P · Haiku  │
  │                                                  │
  │ → Agent-A:  {perturbationA}                      │
  │ → Agent-B:  {perturbationB}                      │
  │                                                  │
  │ Rationale: {rationale}                           │
  │                                        $0.0002   │
  └─────────────────────────────────────────────────┘

  Colores:
    Header: #f59e0b
    Agent-A line: #00e5cc
    Agent-B line: #a78bfa
    Rationale: #6b7280

### ConfigPanel — nueva sección Agent-P
Agregar tercera columna o sección separada con label "Agent-P · Perturbador"
Misma estructura que A y B: provider + model + api key.
Nota visual debajo: "Se ejecuta entre generaciones con Haiku por defecto"

### ReportTab — nueva sección "Perturbaciones"
Agregar después de "Conceptos emergentes", antes de "Aceptados":

  Sección: PERTURBACIONES ENTRE GENERACIONES

  Por cada PerturbationRecord:
    Card con borde #f59e0b:
      G{n} → G{n+1}
      Agent-A recibió: {perturbationA}
      Agent-B recibió: {perturbationB}
      Rationale: {rationale}
      Costo: ${cost}

### Cost breakdown table
Agregar columna "Perturbación" al desglose por generación.
Mostrar costo de Agent-P por fila de generación.
Actualizar fila TOTAL.

---

## 6. Hipótesis que estamos probando

Agregar comentario en src/agents/evolution.ts:

  // HIPÓTESIS: Si la coherencia colapsó por convergencia prematura
  // de priors (G2-G3 = 0% en experimento v1), entonces inyectar
  // diversidad semántica ortogonal entre generaciones debería
  // mantener la tensión productiva.
  //
  // RESULTADO ESPERADO: coherencia crece monotónicamente o al
  // menos no colapsa a 0%.
  //
  // SI SIGUE COLAPSANDO: el problema es la métrica, no los priors.
  // Próximo paso: reemplazar information_gain por distancia
  // semántica via embeddings.

---

## 7. Instrucciones para Claude Code

1. Leer estructura actual del proyecto antes de modificar
2. Agregar grok.ts sin modificar anthropic.ts ni openai.ts
3. Actualizar index.ts dispatcher para incluir "grok"
4. Crear config/models.ts con el catálogo completo
5. Actualizar ConfigPanel para 3 agentes con provider dinámico
6. Agregar prompts de perturbación en prompts.ts
7. Agregar operadores en worldModel.ts
8. Actualizar evolution.ts con betweenGenerations()
9. Actualizar useExperiment.ts con nuevo estado y fase
10. Actualizar LiveTab con PerturbationCard
11. Actualizar ReportTab con sección perturbaciones
12. Actualizar cost breakdown table
13. npm run build — verificar que compila sin errores
