export const stadium = {
  width: 1200,
  height: 800,
  pitch: { x: 400, y: 250, w: 400, h: 300 },
  gates: [
    { id: 'Gate_North', x: 600, y: 50, type: 'gate', capacity: 200, occupancy: 0 },
    { id: 'Gate_South', x: 600, y: 750, type: 'gate', capacity: 200, occupancy: 0 },
    { id: 'Gate_East', x: 1100, y: 400, type: 'gate', capacity: 150, occupancy: 0 },
    { id: 'Gate_West', x: 100, y: 400, type: 'gate', capacity: 150, occupancy: 0 }
  ],
  stands: [
    { id: 'Stand_North', x: 400, y: 120, w: 400, h: 100, type: 'stand', capacity: 100, occupancy: 0 },
    { id: 'Stand_South', x: 400, y: 580, w: 400, h: 100, type: 'stand', capacity: 100, occupancy: 0 },
    { id: 'Stand_East', x: 830, y: 250, w: 100, h: 300, type: 'stand', capacity: 80, occupancy: 0 },
    { id: 'Stand_West', x: 270, y: 250, w: 100, h: 300, type: 'stand', capacity: 80, occupancy: 0 }
  ]
};

export const getAllZones = () => [...stadium.gates, ...stadium.stands];