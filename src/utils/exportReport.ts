import { GenerationResult, ExperimentConfig, PerturbationRecord } from '../types'

function formatDate(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}-${hh}${min}${ss}`
}

function sanitizeFilename(text: string): string {
  return text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20)
}

export function generateReportMarkdown(
  generations: GenerationResult[],
  perturbations: PerturbationRecord[],
  config: ExperimentConfig
): string {
  const allInteractions = generations.flatMap((g) => g.interactions)
  const emerged = allInteractions.filter((i) => i.outcome === 'evolved')
  const accepted = allInteractions.filter((i) => i.outcome === 'accepted')
  const rejected = allInteractions.filter((i) => i.outcome === 'rejected')
  const perturbCost = perturbations.reduce((s, p) => s + p.cost, 0)
  const totalCost = generations.reduce((s, g) => s + g.totalCost, 0) + perturbCost
  const lastA = generations[generations.length - 1].worldModelA
  const lastB = generations[generations.length - 1].worldModelB

  let md = `# Kenshō Experiment Report\n\n`
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`

  // Summary
  md += `## Summary\n\n`
  md += `| Metric | Value |\n`
  md += `|--------|-------|\n`
  md += `| Model A (Generator) | ${config.agentA.model} |\n`
  md += `| Model B (Critic) | ${config.agentB.model} |\n`
  md += `| Model P (Perturbator) | ${config.agentP.model} |\n`
  md += `| Generations | ${generations.length} |\n`
  md += `| Total Interactions | ${allInteractions.length} |\n`
  md += `| Evolved Concepts | ${emerged.length} |\n`
  md += `| Accepted Concepts | ${accepted.length} |\n`
  md += `| Rejected Concepts | ${rejected.length} |\n`
  md += `| Total Cost | $${totalCost.toFixed(4)} |\n`
  md += `| Perturbation Cost | $${perturbCost.toFixed(4)} |\n\n`

  // Coherence Evolution
  md += `## Coherence Evolution\n\n`
  md += `| Generation | Coherence | Cost |\n`
  md += `|------------|-----------|------|\n`
  generations.forEach((g) => {
    md += `| G${g.generation} | ${(g.coherence * 100).toFixed(1)}% | $${g.totalCost.toFixed(4)} |\n`
  })
  md += `\n`

  // Emerged Concepts
  if (emerged.length > 0) {
    md += `## Emerged Concepts\n\n`
    emerged.forEach((i) => {
      md += `### ${i.concept}\n\n`
      md += `**Definition:** ${i.definition}\n\n`
      md += `**Tension Insight:** ${i.tensionInsight}\n\n`
      md += `**Information Gain:** ${i.informationGain.toFixed(4)}\n\n`
      md += `**Generation ${i.generation}, Round ${i.round}**\n\n`
    })
  }

  // Perturbations
  if (perturbations.length > 0) {
    md += `## Perturbations Between Generations\n\n`
    perturbations.forEach((p) => {
      md += `### After Generation ${p.afterGeneration}\n\n`
      md += `**Agent A received:**\n${p.perturbationA}\n\n`
      md += `**Agent B received:**\n${p.perturbationB}\n\n`
      md += `**Rationale:**\n${p.rationale}\n\n`
      md += `**Cost:** $${p.cost.toFixed(5)}\n\n`
    })
  }

  // Accepted Concepts
  if (accepted.length > 0) {
    md += `## Accepted Concepts\n\n`
    accepted.forEach((i) => {
      md += `### ${i.concept}\n\n`
      md += `${i.definition}\n\n`
    })
  }

  // Rejected Concepts
  if (rejected.length > 0) {
    md += `## Rejected Concepts\n\n`
    rejected.forEach((i) => {
      md += `### ${i.concept}\n\n`
      md += `${i.definition}\n\n`
    })
  }

  // Final World Models
  md += `## Final World Models\n\n`

  md += `### Agent A (Generator) - Confirmed Insights\n\n`
  lastA.confirmedInsights.forEach((s) => {
    md += `- ${s}\n`
  })
  md += `\n`

  md += `### Agent A (Generator) - Tension Patterns\n\n`
  lastA.tensionPatterns.forEach((s) => {
    md += `- ${s}\n`
  })
  md += `\n`

  md += `### Agent B (Critic) - Confirmed Insights\n\n`
  lastB.confirmedInsights.forEach((s) => {
    md += `- ${s}\n`
  })
  md += `\n`

  md += `### Agent B (Critic) - Tension Patterns\n\n`
  lastB.tensionPatterns.forEach((s) => {
    md += `- ${s}\n`
  })
  md += `\n`

  // Cost Breakdown Table
  md += `## Cost Breakdown\n\n`
  md += `| Gen | Round | Concept | Generation | Critique | Perturbation | Subtotal |\n`
  md += `|-----|-------|---------|------------|----------|--------------|----------|\n`

  generations.forEach((g) => {
    const perturbCostGen = g.perturbation?.cost ?? 0
    g.interactions.forEach((i, idx) => {
      const isFirstOfGen = idx === 0
      const subtotal = i.stageCosts.generation + i.stageCosts.critique + (isFirstOfGen ? perturbCostGen : 0)
      md += `| G${i.generation} | ${i.round} | ${i.concept} | $${i.stageCosts.generation.toFixed(5)} | $${i.stageCosts.critique.toFixed(5)} | ${
        isFirstOfGen && perturbCostGen > 0 ? `$${perturbCostGen.toFixed(5)}` : '—'
      } | $${subtotal.toFixed(5)} |\n`
    })
  })

  md += `\n**Total:** $${totalCost.toFixed(5)}\n\n`

  return md
}

export function downloadReport(
  generations: GenerationResult[],
  perturbations: PerturbationRecord[],
  config: ExperimentConfig,
  briefName: string = 'experiment'
): void {
  const markdown = generateReportMarkdown(generations, perturbations, config)
  const dateTime = formatDate()
  const sanitized = sanitizeFilename(briefName)
  const filename = `${dateTime}-${sanitized}-kensho.md`

  const blob = new Blob([markdown], { type: 'text/markdown; charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
