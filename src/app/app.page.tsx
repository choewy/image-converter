import {
  CompleteFileList,
  FileDropZone,
  ListWrapper,
  PageContainer,
  SelectFileList,
  TranscodingFileList,
} from './components';

function App() {
  return (
    <PageContainer>
      <FileDropZone />
      <ListWrapper>
        <SelectFileList />
        <TranscodingFileList />
        <CompleteFileList />
      </ListWrapper>
    </PageContainer>
  );
}

export default App;
