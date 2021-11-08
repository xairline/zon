export interface IRoute {
  path: string;
  exact?: boolean;
  name: string;
  icon?: React.ReactElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comp?: any;
}
