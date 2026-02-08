# Strategic Reasoning Principles

Zeo's strategic reasoning layer helps analyze multi-agent interactions where other parties may act against your interests. It integrates game-theoretic insights while maintaining epistemic discipline about strategic uncertainty.

---

## Core Principle

**Strategic modeling increases uncertainty, not decreases it.** When you model other agents' responses, you introduce new variables (their preferences, beliefs, capabilities) that are themselves uncertain. Zeo makes this uncertainty explicit rather than hiding it behind equilibrium assumptions.

---

## Strategic World Model

The strategic world captures the multi-agent context:

```typescript
interface StrategicWorld {
  // Your position
  self: AgentState;
  
  // Other agents with uncertainty
  others: Map<string, AgentModel>;
  
  // Common knowledge vs private information
  informationStructure: InformationStructure;
  
  // Game structure
  interactionType: 'one-shot' | 'repeated' | 'sequential' | 'coalitional';
  
  // Historical context
  priorInteractions: InteractionRecord[];
  
  // Uncertainty bands (strategic uncertainty is always higher)
  uncertaintyMultiplier: number; // Always >= 1.0
}

interface AgentModel {
  agentId: string;
  
  // Beliefs about their objectives (intervals, not point estimates)
  inferredObjectives: Map<string, { low: number; high: number }>;
  
  // Beliefs about their capabilities
  capabilityBounds: { min: number; max: number };
  
  // Beliefs about their information
  informationState: 'informed' | 'uncertain' | 'uninformed';
  
  // Predicted response patterns
  responseModel: ResponseModel;
  
  // Confidence in this model
  modelConfidence: 'low' | 'medium' | 'high';
  
  // Known failure modes
  modelWarnings: string[];
}
```

---

## Adversarial Assumptions

When strategic uncertainty is high, Zeo makes adversarial assumptions explicit:

### Types of Adversarial Assumptions

1. **Worst-Case Response**
   - Assumes other agents act to minimize your outcome
   - Used when: Trust is low, stakes are high, little history
   - Effect: Widens uncertainty bands on downside

2. **Best-Case Response**
   - Assumes other agents act to maximize mutual benefit
   - Used when: Strong relationship, aligned incentives
   - Effect: Widens uncertainty bands on upside

3. **Mixed Response (Default)**
   - Weighted combination based on evidence
   - Weights are themselves uncertain
   - Effect: Uncertainty bands widen on both sides

### Adversarial Assumption Template

```typescript
interface AdversarialAssumption {
  id: string;
  assumptionType: 'worst_case' | 'best_case' | 'mixed';
  description: string;
  
  // Evidence basis
  evidence: EvidencePointer[];
  evidenceStrength: 'weak' | 'moderate' | 'strong';
  
  // Uncertainty quantification
  weightRange: { low: number; high: number };
  
  // What would change this assumption
  flipConditions: FlipCondition[];
  
  // Warnings
  epistemicWarnings: string[];
}
```

---

## Strategic Evaluation

### Interval Payoffs

Unlike standard game theory, Zeo uses interval payoffs to represent strategic uncertainty:

```typescript
interface IntervalPayoff {
  // Your payoff (uncertain)
  self: { low: number; high: number };
  
  // Their payoff (even more uncertain)
  other: { low: number; high: number };
  
  // Joint outcomes
  joint: {
    mutualBenefit: { low: number; high: number };
    conflict: { low: number; high: number };
  };
}
```

### Evaluation Modes

1. **Maximin (Conservative)**
   - Maximize the minimum possible payoff
   - Robust to worst-case responses
   - Best when: High uncertainty, high stakes, adversarial context

2. **Minimax Regret**
   - Minimize maximum regret (difference from best ex-post choice)
   - Robust to hindsight bias
   - Best when: Learning context, reversible decisions

3. **Expected Utility (Risk-Aware)**
   - Weighted average with explicit risk penalty
   - Requires probability distributions
   - Best when: Good data on opponent behavior, low uncertainty

4. **Dominance Check**
   - Is one action clearly better regardless of opponent's move?
   - Most robust, but often inconclusive
   - Always computed first

```typescript
function evaluateStrategicOptions(
  options: StrategicOption[],
  world: StrategicWorld,
  mode: 'maximin' | 'minimax_regret' | 'expected_utility' | 'dominance'
): StrategicEvaluation {
  switch (mode) {
    case 'dominance':
      return checkDominance(options, world);
    case 'maximin':
      return evaluateMaximin(options, world);
    case 'minimax_regret':
      return evaluateMinimaxRegret(options, world);
    case 'expected_utility':
      return evaluateExpectedUtility(options, world);
  }
}
```

---

## Repeated Game Considerations

For repeated interactions, Zeo models:

### Discount Factors

```typescript
interface RepeatedGameContext {
  // Probability of future interactions
  continuationProbability: { low: number; high: number };
  
  // Discount factor for future payoffs
  discountFactor: { low: number; high: number };
  
  // Reputation effects
  reputationImpact: {
    current: ReputationState;
    futureOptions: Map<string, ReputationEffect>;
  };
  
  // Learning potential
  informationValue: { low: number; high: number };
}
```

### Strategic Patterns

- **Tit-for-Tat**: Cooperate initially, mirror opponent's last move
- **Grim Trigger**: Cooperate until defection, then punish forever
- **Forgiving**: Cooperate initially, punish briefly, then forgive
- **Bullying**: Defect initially, test if opponent is exploitable

Each pattern has uncertainty bands on effectiveness.

---

## Epistemic Discipline in Strategy

### What Zeo Does

1. **Makes uncertainty explicit**: All strategic variables have confidence bands
2. **Documents assumptions**: Every strategic model is labeled with confidence
3. **Tracks model failures**: When predictions fail, update uncertainty (not just parameters)
4. **Flags model fragility**: When small changes flip strategic recommendations

### What Zeo Does NOT Do

1. **Predict opponent behavior exactly**: Models provide ranges, not point predictions
2. **Claim equilibrium solutions**: Equilibria are fragile; Zeo prefers robustness
3. **Hide strategic uncertainty**: Uncertainty is surfaced, not smoothed away
4. **Provide "optimal" strategies**: Only robust or dominant actions are recommended

---

## Integration with Branching Engine

Strategic reasoning feeds into the branching engine by:

1. **Generating opponent response branches**: Each action branches on plausible opponent responses
2. **Weighting branches by uncertainty**: More uncertain responses get wider probability bands
3. **Propagating strategic uncertainty**: Strategic uncertainty widens all downstream branches
4. **Flagging strategic collapse points**: Where opponent moves resolve key uncertainties

```typescript
function generateStrategicBranches(
  action: Action,
  world: StrategicWorld,
  depth: number
): BranchGraph {
  const branches: BranchNode[] = [];
  
  for (const [agentId, agentModel] of world.others) {
    // Generate plausible responses
    const responses = generatePlausibleResponses(action, agentModel);
    
    for (const response of responses) {
      branches.push({
        id: `${action.id}-${agentId}-${response.type}`,
        type: 'opponent_response',
        agentId,
        response,
        probabilityRange: response.probabilityRange, // Uncertain!
        dependencies: [`${action.id}`],
        children: depth > 0 
          ? generateStrategicBranches(response, world, depth - 1)
          : []
      });
    }
  }
  
  return { nodes: branches };
}
```

---

## UI Integration

### Strategy Lens Panel

Displays adversarial assumptions and strategic context:
- Agent models with confidence levels
- Response predictions with uncertainty
- Evaluation mode (maximin, minimax regret, etc.)
- Strategic warnings and caveats

### Strategic Scenario Testing

Allows users to test how recommendations change under different strategic assumptions:
- "What if they're more adversarial?"
- "What if they have more information?"
- "What if this is a one-shot vs repeated game?"

---

## Testing

### Invariant: Strategic Uncertainty Increases Total Uncertainty

```typescript
const baseUncertainty = computeTotalUncertainty(baseBranches);
const strategicBranches = generateStrategicBranches(action, world, 1);
const strategicUncertainty = computeTotalUncertainty(strategicBranches);

expect(strategicUncertainty).toBeGreaterThanOrEqual(baseUncertainty);
```

### Invariant: Maximin Never Recommends Dominated Actions

```typescript
const dominatedActions = findDominatedActions(options, world);
const maximinResult = evaluateStrategicOptions(options, world, 'maximin');

for (const action of maximinResult.topActions) {
  expect(dominatedActions).not.toContain(action.id);
}
```

### Invariant: Strategic Recommendations Include Confidence

```typescript
const result = evaluateStrategicOptions(options, world, 'maximin');
expect(result.confidence).toBeDefined();
expect(result.epistemicWarnings).toHaveLength.greaterThan(0);
```

---

## References

- Game Theory (von Neumann, Morgenstern, Nash)
- Robust Optimization (Ben-Tal, El Ghaoui, Nemirovski)
- Epistemic Game Theory (Brandenburger)
- Strategic Decision Making (Dixit, Nalebuff)
