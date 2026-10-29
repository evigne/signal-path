// Simple 2-D pass geometry for the home-page hero: a circular orbit passing directly
// over a ground station. Good enough to show AOS → max elevation → LOS, slant range,
// light time and the Doppler sign; not a flight-dynamics tool.

export const EARTH_RADIUS_KM = 6371;
export const MU_KM3_S2 = 398600.4418;
export const C_KM_S = 299792.458;

export type PassPoint = {
  phiDeg: number; // orbit angle from the station's zenith (negative = approaching)
  elevationDeg: number;
  rangeKm: number;
  rangeRateKmS: number; // negative while approaching
  lightTimeMs: number;
  dopplerKHz: number; // at the carrier given to passPoint
};

export function orbitalRate(altKm: number) {
  const r = EARTH_RADIUS_KM + altKm;
  return Math.sqrt(MU_KM3_S2 / r) / r; // rad/s
}

function geometry(phi: number, altKm: number) {
  const r = EARTH_RADIUS_KM + altKm;
  const dx = r * Math.sin(phi);
  const dy = r * Math.cos(phi) - EARTH_RADIUS_KM;
  const range = Math.hypot(dx, dy);
  return { range, elevation: Math.asin(dy / range) };
}

export function passPoint(phiDeg: number, altKm: number, carrierMHz = 2200): PassPoint {
  const phi = (phiDeg * Math.PI) / 180;
  const { range, elevation } = geometry(phi, altKm);
  const h = 1e-4;
  const dRdPhi = (geometry(phi + h, altKm).range - geometry(phi - h, altKm).range) / (2 * h);
  const rangeRate = dRdPhi * orbitalRate(altKm);
  return {
    phiDeg,
    elevationDeg: (elevation * 180) / Math.PI,
    rangeKm: range,
    rangeRateKmS: rangeRate,
    lightTimeMs: (range / C_KM_S) * 1000,
    dopplerKHz: (-carrierMHz * 1000 * rangeRate) / C_KM_S,
  };
}

/** Orbit angle (degrees from zenith) at which the spacecraft crosses the elevation mask. */
export function maskAngleDeg(altKm: number, maskDeg: number) {
  let lo = 0;
  let hi = 60;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (passPoint(mid, altKm).elevationDeg > maskDeg) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Seconds between AOS and LOS for an overhead pass above the mask. */
export function passDurationS(altKm: number, maskDeg: number) {
  return ((2 * maskAngleDeg(altKm, maskDeg) * Math.PI) / 180) / orbitalRate(altKm);
}
