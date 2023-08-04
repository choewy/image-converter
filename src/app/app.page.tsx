import {
  CompleteFileList,
  FileDropZone,
  ListWrapper,
  PageContainer,
  SelectFileList,
  TranscodingFileList,
  WorkerList,
} from './components';

function App() {
  return (
    <PageContainer>
      <FileDropZone />
      <ListWrapper>
        <SelectFileList />
        <TranscodingFileList />
        <WorkerList />
        <CompleteFileList />
      </ListWrapper>
    </PageContainer>
  );
}

export default App;
