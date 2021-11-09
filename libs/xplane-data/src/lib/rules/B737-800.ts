import {
  COMMON_DESCEND_RULES,
  COMMON_TAXI_RULES,
  DEFAULT_RULES,
  IRules,
} from './rules';

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
            value: 22,
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
  ],
  descendRules: [...COMMON_DESCEND_RULES],
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
            value: 1,
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
        type: 'climb',
        params: {
          event: 'angle of attack is too small during landing (< 1 deg)',
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
            value: 'landing',
          },
        ],
      },
      event: {
        type: 'climb',
        params: {
          event: 'angle of attack is too much during landing (> 8 deg)',
        },
      },
    },
  ],
};
