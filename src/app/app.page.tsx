import { AppComponents } from './app.components';

const appComponent = AppComponents.of();

function App() {
  return (
    <appComponent.renderContainer>
      <appComponent.renderHeader />
      <appComponent.renderSelectList />
      <appComponent.renderProcessList />
      <appComponent.renderCompleteList />
    </appComponent.renderContainer>
  );
}

export default App;
