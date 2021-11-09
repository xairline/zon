import { IRules, DEFAULT_RULES, COMMON_TAXI_RULES, COMMON_DESCEND_RULES } from './rules';

export const RULES: IRules = {
  defaultRules: DEFAULT_RULES,
  taxiRules: [...COMMON_TAXI_RULES],
  climbRules: [
    {
      name: 'Climb: AOA_too_small',
      priority: 1,
      conditions: {
        all: [
          {
            fact: 'dataref',
            path: '$.ts',
            operator: 'greaterThan',
            value: 0,
          },
          {
            fact: 'dataref',
            path: '$.agl',
            operator: 'lessThan',
            value: 500 / 3.28,
          },
          {
            fact: 'dataref',
            path: '$.agl',
            operator: 'greaterThan',
            value: 40 / 3.28,
          },
          {
            fact: 'dataref',
            path: '$.pitch',
            operator: 'lessThan',
            value: 8,
          },
          {
            fact: 'dataref',
            path: '$.gearForce',
            operator: 'lessThan',
            value: 1,
          },
          {
            fact: 'dataref',
            path: '$.state',
            operator: 'equal',
            value: 'climb',
          },
        ],
      },
      event: {
        type: 'climb',
        params: {
          event: 'angle of attack is too small during initial climb (<8 deg)',
        },
      },
    },
    {
      name: 'Climb: AOA_too_much',
      priority: 1,
      conditions: {
        all: [
          {
            fact: 'dataref',
            path: '$.ts',
            operator: 'greaterThan',
            value: 0,
          },
          {
            fact: 'dataref',
            path: '$.agl',
            operator: 'lessThan',
            value: 500 / 3.28,
          },
          {
            fact: 'dataref',
            path: '$.agl',
            operator: 'greaterThan',
            value: 40 / 3.28,
          },
          {
            fact: 'dataref',
            path: '$.pitch',
            operator: 'greaterThan',
            value: 20,
          },
          {
            fact: 'dataref',
            path: '$.gearForce',
            operator: 'lessThan',
            value: 1,
          },
          {
            fact: 'dataref',
            path: '$.state',
            operator: 'equal',
            value: 'climb',
          },
        ],
      },
      event: {
        type: 'climb',
        params: {
          event: 'angle of attack is too much during initial climb (>22 deg)',
        },
      },
    },
    {
      name: 'Climb: Speed is too slow',
      priority: 1,
      conditions: {
        all: [
          {
            fact: 'dataref',
            path: '$.ts',
            operator: 'greaterThan',
            value: 0,
          },
          {
            fact: 'dataref',
            path: '$.ias',
            operator: 'lessThan',
            value: 140,
          },
          {
            fact: 'dataref',
            path: '$.state',
            operator: 'equal',
            value: 'climb',
          },
        ],
      },
      event: {
        type: 'climb',
        params: {
          event: 'climb speed is too slow (< 140kt)',
        },
      },
    },
    {
      name: 'Climb: Speed is too fast',
      priority: 1,
      conditions: {
        all: [
          {
            fact: 'dataref',
            path: '$.ts',
            operator: 'greaterThan',
            value: 0,
          },
          {
            fact: 'dataref',
            path: '$.ias',
            operator: 'greaterThan',
            value: 250,
          },
          {
            fact: 'dataref',
            path: '$.elevation',
            operator: 'lessThan',
            value: 10000 / 3.28,
          },
          {
            fact: 'dataref',
            path: '$.state',
            operator: 'equal',
            value: 'climb',
          },
        ],
      },
      event: {
        type: 'climb',
        params: {
          event: 'climb speed is too fast (> 250kt below 10,000ft)',
        },
      },
    },
  ],
  descendRules: [
    ...COMMON_DESCEND_RULES
  ],
  landingRules: [
    {
      name: 'Landing: AOA_too_small',
      priority: 1,
      conditions: {
        all: [
          {
            fact: 'dataref',
            path: '$.ts',
            operator: 'greaterThan',
            value: 0,
          },
          {
            fact: 'dataref',
            path: '$.pitch',
            operator: 'lessThan',
            value: 2,
          },
          {
            fact: 'dataref',
            path: '$.gearForce',
            operator: 'lessThan',
            value: 1,
          },
          {
            fact: 'dataref',
            path: '$.state',
            operator: 'equal',
            value: 'landing',
          },
        ],
      },
      event: {
        type: 'landing',
        params: {
          event: 'angle of attack is too small during landing (< 2 deg)',
        },
      },
    },
    {
      name: 'Landing: AOA_too_much',
      priority: 1,
      conditions: {
        all: [
          {
            fact: 'dataref',
            path: '$.ts',
            operator: 'greaterThan',
            value: 0,
          },
          {
            fact: 'dataref',
            path: '$.pitch',
            operator: 'greaterThan',
            value: 10,
          },
          {
            fact: 'dataref',
            path: '$.gearForce',
            operator: 'lessThan',
            value: 1,
          },
          {
            fact: 'dataref',
            path: '$.state',
            operator: 'equal',
            value: 'landing',
          },
        ],
      },
      event: {
        type: 'landing',
        params: {
          event: 'angle of attack is too much during landing (> 10 deg)',
        },
      },
    },
  ],
};
