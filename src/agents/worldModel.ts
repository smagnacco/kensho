import { WorldModel } from '../types'

export function emptyWorldModel(): WorldModel {
  return {
    confirmedInsights: [],
    rejectedPaths: [],
    tensionPatterns: [],
    theoryOfOther: 'Unknown — first generation',
  }
}

export function safeWM(raw: unknown): WorldModel {
  const r = raw as Record<string, unknown>
  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

  return {
    confirmedInsights: toStringArray(r?.confirmedInsights),
    rejectedPaths: toStringArray(r?.rejectedPaths),
    tensionPatterns: toStringArray(r?.tensionPatterns),
    theoryOfOther: typeof r?.theoryOfOther === 'string' ? r.theoryOfOther : 'Unknown',
  }
}

export function saj(arr: string[]): string {
  if (!Array.isArray(arr) || arr.length === 0) return '(none yet)'
  return arr.join(' | ')
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample<T>(arr: T[], ratio: number): T[] {
  return shuffle(arr).slice(0, Math.ceil(arr.length * ratio))
}

export function applyPerturbation(wm: WorldModel, perturbation: string, keepRatio = 0.65): WorldModel {
  const keptInsights = shuffle(wm.confirmedInsights).slice(
    0,
    Math.ceil(wm.confirmedInsights.length * keepRatio),
  )
  return {
    ...wm,
    confirmedInsights: keptInsights,
    rejectedPaths: [...wm.rejectedPaths, `PREGUNTA ABIERTA: ${perturbation}`],
  }
}

export function crossoverTensions(
  wmA: WorldModel,
  wmB: WorldModel,
  ratio = 0.25,
): { newWmA: WorldModel; newWmB: WorldModel } {
  const tensionsFromB = sample(wmB.tensionPatterns, ratio)
  const tensionsFromA = sample(wmA.tensionPatterns, ratio)
  return {
    newWmA: { ...wmA, tensionPatterns: [...wmA.tensionPatterns, ...tensionsFromB] },
    newWmB: { ...wmB, tensionPatterns: [...wmB.tensionPatterns, ...tensionsFromA] },
  }
}
