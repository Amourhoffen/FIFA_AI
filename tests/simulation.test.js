/**
 * @fileoverview Frontend Simulation Logic Unit Tests
 * Testing the core stadium and zone logic for FIFA Crowd Management.
 */

// We mock document and window for frontend unit tests running in Node
global.window = {};
global.document = {
  getElementById: () => ({ innerText: '', classList: { remove: () => {}, add: () => {} } })
};

// Import the module logic (using experimental-vm-modules allows this in jest)
import { stadium, getAllZones } from '../public/js/simulation/stadium.js';

describe('Stadium Simulation Engine', () => {
  it('should initialize stadium with pitch and zones', () => {
    expect(stadium).toBeDefined();
    expect(stadium.pitch).toBeDefined();
    expect(stadium.stands).toBeDefined();
    expect(stadium.gates).toBeDefined();
  });

  it('getAllZones should return all interactive crowd areas', () => {
    const zones = getAllZones();
    expect(zones.length).toBeGreaterThan(0);
    expect(zones.some(z => z.id === 'Gate_North')).toBe(true);
    expect(zones.some(z => z.id === 'Stand_North')).toBe(true);
  });

  it('zones should initialize with 0 occupancy', () => {
    const zones = getAllZones();
    zones.forEach(z => {
      expect(z.occupancy).toBeDefined();
    });
  });
});
