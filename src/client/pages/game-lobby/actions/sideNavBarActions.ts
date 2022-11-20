export type NavBarAction = {
  type: 'TEST_ACTION';
  test: string;
};

export const testAction = (test: string): NavBarAction => {
  return {
    type: 'TEST_ACTION',
    test
  };
};
