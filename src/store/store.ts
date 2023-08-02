import { v4 } from 'uuid';
import {
  atom,
  RecoilState,
  Resetter,
  SetterOrUpdater,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';

export class Store<T> {
  public static define<T>(origin?: T) {
    return new Store<T>(origin);
  }

  private readonly key = v4();
  private readonly state: RecoilState<T>;

  constructor(private readonly origin?: T) {
    this.state = atom({
      key: this.key,
      default: this.origin,
    });
  }

  public useValue(): T {
    return useRecoilValue(this.state);
  }

  public useState(): [T, SetterOrUpdater<T>] {
    return useRecoilState(this.state);
  }

  public useSetState(): SetterOrUpdater<T> {
    return useSetRecoilState(this.state);
  }

  public useResetState(): Resetter {
    return useResetRecoilState(this.state);
  }
}
