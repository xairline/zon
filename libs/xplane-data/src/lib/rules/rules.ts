import { RuleProperties } from 'json-rules-engine';
import { FlightData } from '../xplane-data.interfaces';
export interface IRules {
  defaultRules?: RuleProperties[];
  taxiRules?: RuleProperties[];
  takeoffRules?: RuleProperties[];
  climbRules?: RuleProperties[];
  cruiseRules?: RuleProperties[];
  descendRules?: RuleProperties[];
  landingRules?: RuleProperties[];
}

export const DEFAULT_RULES = [
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.n1',
          operator: 'greaterThan',
          value: 20,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'equal',
          value: 'parked',
        },
      ],
    },
    event: {
      type: 'engine started',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.n1',
          operator: 'greaterThan',
          value: 20,
        },
        {
          fact: 'dataref',
          path: '$.gs',
          operator: 'greaterThan',
          value: 2,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'equal',
          value: 'engine started',
        },
      ],
    },
    event: {
      type: 'taxi',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.gs',
          operator: 'greaterThan',
          value: 35,
        },
        {
          fact: 'dataref',
          path: '$.n1',
          operator: 'greaterThan',
          value: 50,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'equal',
          value: 'taxi',
        },
      ],
    },
    event: {
      type: 'takeoff',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          any: [
            {
              fact: 'dataref',
              path: '$.n1',
              operator: 'lessThan',
              value: 50,
            },
            {
              fact: 'dataref',
              path: '$.ias',
              operator: 'lessThan',
              value: 40,
            },
          ],
        },
        {
          fact: 'dataref',
          path: '$.gearForce',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'equal',
          value: 'takeoff',
        },
      ],
    },
    event: {
      type: 'RTO',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.vs',
          operator: 'greaterThan',
          value: 200, //vs>200ft/min
        },
        {
          fact: 'dataref',
          path: '$.gearForce',
          operator: 'lessThan',
          value: 1,
        },
        {
          any: [
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'takeoff',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'cruise',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'climb',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'descend',
            },
          ],
        },
      ],
    },
    event: {
      type: 'climb',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.vs',
          operator: 'greaterThan',
          value: -200, //vs>-200ft/min
        },
        {
          fact: 'dataref',
          path: '$.vs',
          operator: 'lessThan',
          value: 200, //vs<200ft/min
        },
        {
          fact: 'dataref',
          path: '$.gearForce',
          operator: 'lessThan',
          value: 1,
        },
        {
          any: [
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'descend',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'climb',
            },
          ],
        },
      ],
    },
    event: {
      type: 'cruise',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.vs',
          operator: 'lessThan',
          value: -200, //vs<-200ft/min
        },
        {
          fact: 'dataref',
          path: '$.gearForce',
          operator: 'lessThan',
          value: 1,
        },
        {
          any: [
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'climb',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'cruise',
            },
          ],
        },
      ],
    },
    event: {
      type: 'descend',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.agl',
          operator: 'lessThan',
          value: 30,
        },
        {
          fact: 'dataref',
          path: '$.vs',
          operator: 'lessThan',
          value: -200,
        },
        {
          fact: 'dataref',
          path: '$.gearForce',
          operator: 'lessThan',
          value: 5,
        },
        {
          any: [
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'descend',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'cruise',
            },
          ],
        },
      ],
    },
    event: {
      type: 'landing',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.n1',
          operator: 'greaterThan',
          value: 20,
        },
        {
          fact: 'dataref',
          path: '$.gs',
          operator: 'greaterThan',
          value: 2,
        },
        {
          fact: 'dataref',
          path: '$.ias',
          operator: 'lessThan',
          value: 40,
        },
        {
          any: [
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'RTO',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'landing',
            },
          ],
        },
      ],
    },
    event: {
      type: 'taxi',
    },
  },
  {
    priority: 999,
    conditions: {
      all: [
        {
          fact: 'dataref',
          path: '$.n1',
          operator: 'equal',
          value: 0,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'equal',
          value: 'taxi',
        },
      ],
    },
    event: {
      type: 'engine stopped',
    },
  },
];

export class Rules {
  rules: IRules;
  constructor(flightData: FlightData) {
    this.rules = { defaultRules: [] };
    this.setDefaultRules(flightData);
  }

  public getRules() {
    let res: RuleProperties[] = [];
    if (this.rules.defaultRules) {
      res = [...res, ...(this.rules?.defaultRules || [])];
    }

    return res;
  }

  public getReadableRules() {
    return;
  }

  private setDefaultRules(flightData: FlightData) {
    this.rules.defaultRules = DEFAULT_RULES?.map((rule) => {
      return { ...rule };
    });
  }
}
