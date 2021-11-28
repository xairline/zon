import { RuleProperties } from 'json-rules-engine';
import { FlightData } from '../xplane-data.interfaces';
export interface IRules {
  defaultRules?: RuleProperties[];
  TaxiRules?: RuleProperties[];
  TakeoffRules?: RuleProperties[];
  ClimbRules?: RuleProperties[];
  CruiseRules?: RuleProperties[];
  DescentRules?: RuleProperties[];
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
          value: 'Parked',
        },
      ],
    },
    event: {
      type: 'Engine Started',
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
          value: 'Engine Started',
        },
      ],
    },
    event: {
      type: 'Taxi',
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
          value: 'Taxi',
        },
      ],
    },
    event: {
      type: 'Takeoff',
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
          value: 'Takeoff',
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
              value: 'Takeoff',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'Cruise',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'Climb',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'Descent',
            },
          ],
        },
      ],
    },
    event: {
      type: 'Climb',
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
              value: 'Descent',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'Climb',
            },
          ],
        },
      ],
    },
    event: {
      type: 'Cruise',
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
              value: 'Climb',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'Cruise',
            },
          ],
        },
      ],
    },
    event: {
      type: 'Descent',
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
              value: 'Descent',
            },
            {
              fact: 'dataref',
              path: '$.state',
              operator: 'equal',
              value: 'Cruise',
            },
          ],
        },
      ],
    },
    event: {
      type: 'Landing',
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
              value: 'Landing',
            },
          ],
        },
      ],
    },
    event: {
      type: 'Taxi',
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
          value: 'Taxi',
        },
      ],
    },
    event: {
      type: 'Engine Stopped',
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
