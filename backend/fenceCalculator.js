const RATE_TABLE = Object.freeze({
  4: Object.freeze({
    height: 4,
    feetRate: 55,
    stoneRate: 380,
    supportStoneRate: 380,
    labourRate: 16,
  }),
  5: Object.freeze({
    height: 5,
    feetRate: 55,
    stoneRate: 380,
    supportStoneRate: 380,
    labourRate: 16,
  }),
  6: Object.freeze({
    height: 6,
    feetRate: 55,
    stoneRate: 370,
    supportStoneRate: 370,
    labourRate: 20,
  }),
});

const SUPPORTED_HEIGHTS = Object.freeze(
  Object.keys(RATE_TABLE)
    .map((height) => Number(height))
    .sort((left, right) => left - right)
);

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function getRatesByHeight(height) {
  return RATE_TABLE[toNumber(height)] || null;
}

function validateFenceInput(payload = {}) {
  const values = {
    noOfFeet: toNumber(payload.noOfFeet),
    stonePerFeet: toNumber(payload.stonePerFeet),
    supportStonePerFeet: toNumber(payload.supportStonePerFeet),
    noOfBarbedWireLines: toNumber(payload.noOfBarbedWireLines),
    height: toNumber(payload.height),
  };

  if (!SUPPORTED_HEIGHTS.includes(values.height)) {
    return {
      error: `Supported heights are ${SUPPORTED_HEIGHTS.join(", ")} feet`,
      statusCode: 400,
    };
  }

  const fieldLabels = {
    noOfFeet: "No of feet",
    stonePerFeet: "Stone per feet",
    supportStonePerFeet: "Support stone per feet",
    noOfBarbedWireLines: "No of barbed wire lines",
  };

  for (const [key, label] of Object.entries(fieldLabels)) {
    if (!Number.isFinite(values[key]) || values[key] <= 0) {
      return {
        error: `${label} must be greater than 0`,
        statusCode: 400,
      };
    }
  }

  const rates = getRatesByHeight(values.height);

  if (!rates) {
    return {
      error: `Rate not found for ${values.height} feet`,
      statusCode: 404,
    };
  }

  return { values, rates };
}

function calculateFence(payload = {}) {
  const validation = validateFenceInput(payload);

  if (validation.error) {
    return validation;
  }

  const { values, rates } = validation;

  const noOfStone = values.noOfFeet / values.stonePerFeet;
  const supportStone = (noOfStone / values.supportStonePerFeet) * 2;
  const barbedWireWeight = Math.round(
    (values.noOfFeet * values.noOfBarbedWireLines) / 33
  );
  const kattuKambi = values.noOfFeet * 0.015;
  const labour = values.noOfFeet;

  const feetAmount = values.noOfFeet * rates.feetRate;
  const stoneAmount = noOfStone * rates.stoneRate;
  const supportStoneAmount = supportStone * rates.supportStoneRate;
  const barbedWireRate = values.noOfBarbedWireLines * 5;
  const barbedWireAmount =
    values.noOfBarbedWireLines * values.noOfFeet * 5;
  const labourAmount = labour * rates.labourRate;
  const totalAmount =
    feetAmount +
    stoneAmount +
    supportStoneAmount +
    barbedWireAmount +
    labourAmount;

  return {
    rates: {
      ...rates,
      barbedWireRate,
    },
    calculations: {
      noOfStone,
      supportStone,
      barbedWireWeight,
      kattuKambi,
      labour,
      feetAmount,
      stoneAmount,
      supportStoneAmount,
      barbedWireRate,
      barbedWireAmount,
      labourAmount,
      totalAmount,
    },
  };
}

module.exports = {
  SUPPORTED_HEIGHTS,
  getRatesByHeight,
  calculateFence,
};
