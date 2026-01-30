import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;
