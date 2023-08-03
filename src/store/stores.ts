import { Store } from './store';
import { FileListStoreValue } from './store.value';

export class FileListStore extends Store<FileListStoreValue> {
  public static of() {
    return new FileListStore(FileListStoreValue.of());
  }
}

export const fileListStore = FileListStore.of();
