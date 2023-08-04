import { Store } from './store';
import { FileListStoreValue, WorkerStoreValue } from './store.value';

export class WorkerStore extends Store<WorkerStoreValue> {
  public static of() {
    return new WorkerStore(WorkerStoreValue.of());
  }
}

export class FileListStore extends Store<FileListStoreValue> {
  public static of() {
    return new FileListStore(FileListStoreValue.of());
  }
}

export const workerStore = WorkerStore.of();
export const fileListStore = FileListStore.of();
