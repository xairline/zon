import {
  AllConditions,
  Almanac,
  Event,
  EventHandler,
  RuleProperties,
  RuleResult,
} from 'json-rules-engine';
import { XPlaneData } from '../xplane-data';
import { FlightData, FlightState } from '../xplane-data.interfaces';
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
          path: '$.ts',
          operator: 'greaterThan',
          value: 0,
        },
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
          path: '$.ts',
          operator: 'greaterThan',
          value: 0,
        },
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
          path: '$.ts',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'dataref',
          path: '$.n1',
          operator: 'greaterThan',
          value: 75,
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
          fact: 'dataref',
          path: '$.ts',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'dataref',
          path: '$.vs',
          operator: 'greaterThan',
          value: 200 / 196.85, //vs>200ft/min
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
          path: '$.ts',
          operator: 'greaterThan',
          value: 0,
        },
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
          value: -200 / 196.85,
        },
        {
          fact: 'dataref',
          path: '$.gearForce',
          operator: 'lessThan',
          value: 5,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'notEqual',
          value: 'landing',
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'notEqual',
          value: 'climb',
        },
      ],
    },
    event: {
      type: 'landing',
    },
  },
];

export const COMMON_TAXI_RULES = [
  {
    name: 'taxi_over_speed',
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
          path: '$.gs',
          operator: 'greaterThan',
          value: 30 / 1.9438,
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
      type: 'taxi',
      params: {
        event: 'taxi_over_speed (30)',
      },
    },
  },
];

export const COMMON_DESCEND_RULES = [
  {
    name: 'Descend: too fast',
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
          path: '$.vs',
          operator: 'lessThan',
          value: -2500 / 196.85,
        },
        {
          fact: 'dataref',
          path: '$.state',
          operator: 'equal',
          value: 'descend',
        },
      ],
    },
    event: {
      type: 'descend',
      params: {
        event: 'vertical speed is over -2,500 ft/min',
      },
    },
  },
  {
    name: 'Descend: Speed is too fast',
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
          value: 'descend',
        },
      ],
    },
    event: {
      type: 'descend',
      params: {
        event: 'descend speed is too fast (> 250kt below 10,000ft)',
      },
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
