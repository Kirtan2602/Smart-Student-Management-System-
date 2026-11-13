export const round2 = (n) => Math.round(n * 100) / 100;

export const sum = (list) => list.reduce((total, n) => total + n, 0);

// percentage = obtained / max * 100 (2 decimal)
export const pct = (obtained, max) => (max > 0 ? round2((obtained / max) * 100) : null);