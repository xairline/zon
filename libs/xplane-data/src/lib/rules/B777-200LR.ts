import { COMMON_DESCEND_RULES, COMMON_TAXI_RULES, DEFAULT_RULES, IRules } from './rules';

export const RULES: IRules = {
  defaultRules: DEFAULT_RULES,
  taxiRules: [...COMMON_TAXI_RULES],
  descendRules: [...COMMON_DESCEND_RULES],
};
