const buildProvidersTree = (componentsWithProps) => {
  const initialComponent = ({ children }) => <>{children}</>;
  return componentsWithProps.reduce(
    (AccumulatedComponents, [Provider, props = {}]) => {
      return ({ children }) => {
        return (
          <AccumulatedComponents>
            <Provider {...props}>{children}</Provider>
          </AccumulatedComponents>
        );
      };
    },
    initialComponent
  );
};

export default function MultiContextProvider({ children, providers }) {
  const ProvidersTree = buildProvidersTree(providers);

  return <ProvidersTree>{children}</ProvidersTree>;
}
