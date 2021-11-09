export * from './rules';

export const getSupportedAircrafts = () => [
  'B737-800',
  'B747-400',
  'B747-8',
  'B767-300',
  'B777-200',
  'B777-200LR',
  'B777-300ER',
  'B787-8',
  'B787-9',
  'A319',
  'A320',
  'A321',
  'A330',
  'A340',
  'A350',
  'A380',
];

export const getDefaultCapacityByType = (type: string): number => {
  const defaultCapacity = {
    'B737-800': 144,
    'B747-400': 416,
    'B747-8': 467,
    'B767-300': 290,
    'B777-200': 313,
    'B777-200LR': 313,
    'B777-300ER': 396,
    'B787-8': 359,
    'B787-9': 406,
    A319: 120,
    A320: 170,
    A321: 200,
    A330: 290,
    A340: 420,
    A350: 350,
    A380: 525,
  } as { [x: string]: number };
  return defaultCapacity[type] as number;
};


export const getLeasePriceByType = (type: string): number => {
  const leasePrice = {
    'B737-800': 100,
    'B747-400': 500,
    'B747-8': 400,
    'B767-300': 300,
    'B777-200': 400,
    'B777-200LR': 450,
    'B777-300ER': 450,
    'B787-8': 300,
    'B787-9': 300,
    A319: 100,
    A320: 120,
    A321: 150,
    A330: 300,
    A340: 400,
    A350: 350,
    A380: 500,
  } as { [x: string]: number };
  return leasePrice[type] as number;
};