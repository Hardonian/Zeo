# Measurement Theory Layer

The Measurement Theory Layer prevents category errors and invalid mathematical operations by enforcing scale-aware computation.

## Overview

Based on Stevens' four levels of measurement (nominal, ordinal, interval, ratio) plus probability, this layer ensures that:
- Ordinal scales cannot be averaged
- Different currencies cannot be directly compared
- Interval scales cannot be used for ratio operations
- Operations are validated against their mathematical permissibility

## Key Concepts

### Scale Types

- **Nominal**: Categories without order (colors, types) - only equality/inequality
- **Ordinal**: Ordered categories with non-uniform intervals (Likert scales) - median/rank only
- **Interval**: Uniform intervals but no true zero (Celsius) - differences valid, ratios invalid
- **Ratio**: Uniform intervals with true zero (USD, seconds) - all operations valid
- **Probability**: Special handling for [0,1] values - no summing

### Built-in Scales

- `nominal_default` - General categorical data
- `ordinal_likert` - Survey/assessment scales
- `interval_celsius/fahrenheit/kelvin` - Temperature scales
- `ratio_usd/eur/gbp` - Currency scales (cannot be directly compared)
- `ratio_seconds` - Time duration
- `probability_default` - Probability values

## Usage

```typescript
import {
  scaleRegistry,
  assertCompatibleScales,
  assertOperationAllowed,
  computeMean,
  createMeasurementValue
} from "@zeo/measurement";

// Get a scale
const usdScale = scaleRegistry.get("ratio_usd");

// Check if operation is allowed
assertOperationAllowed(usdScale, "mean"); // OK

// Check scale compatibility
const eurScale = scaleRegistry.get("ratio_eur");
assertCompatibleScales(usdScale, eurScale); // Throws - different currencies!

// Create measurement values
const price1 = createMeasurementValue("ratio_usd", 100);
const price2 = createMeasurementValue("ratio_usd", { low: 90, high: 110 });

// Compute with validation
const avgPrice = computeMean([price1, price2], usdScale);
```

## Error Prevention

The layer throws `MeasurementError` for:
- Averaging ordinal scales (Likert scales)
- Comparing different currencies without conversion
- Computing ratios on interval scales (Celsius)
- Invalid operations on probability values

## Testing

21 tests covering:
- Scale registration and retrieval
- Compatibility checking
- Operation validation
- Forbidden operation detection
- Value band computation
