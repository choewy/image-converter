import { ChangeEvent, PropsWithChildren, ReactElement, useCallback } from 'react';

import { FfmpegFile, FfmpegService, ffmpegService } from '@/core';
import { selectFileStore } from '@/store';

export class AppComponents {
  public static of() {
    return new AppComponents(ffmpegService);
  }

  constructor(private readonly ffmpegService: FfmpegService) {}

  public renderContainer(props: PropsWithChildren): ReactElement {
    return <div>{props.children}</div>;
  }

  public renderHeader(): ReactElement {
    return (
      <header>
        <span>
          파일을 드래그하여 추가하거나, 파일 추가 버튼을 클릭하여 변환할 파일을 추가하세요.
          <br />
          변환된 파일은 원본 파일이 있는 폴더에 저장됩니다.
        </span>
      </header>
    );
  }

  public renderSelectList(): ReactElement {
    const [files, setFiles] = selectFileStore.useState();
    const enqueueFile = selectFileStore.useEnqueue();

    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => enqueueFile(e.target.files), [enqueueFile]);
    const onClickTranscode = () => useCallback(() => {}, [setFiles]);

    const onClickReset = () =>
      useCallback(() => {
        setFiles((prev) => ({ ...prev, files: [] }));
      }, [setFiles]);

    return (
      <main>
        <div>불러온 파일</div>
        <div>
          <input type="file" multiple={true} onChange={onChange} />
          <button disabled={files.length === 0} onClick={onClickTranscode}>
            변환 시작
          </button>
          <button disabled={files.length === 0} onClick={onClickReset}>
            목록 비우기
          </button>
        </div>
        <ul>
          {files.map((file) => (
            <li>1</li>
          ))}
        </ul>
      </main>
    );
  }

  public renderProcessList(): ReactElement {
    const files: File[] = [];

    return (
      <main>
        <div>변환중인 파일</div>
        <ul>
          {files.map((file) => (
            <li>{file.name}</li>
          ))}
        </ul>
      </main>
    );
  }

  public renderCompleteList(): ReactElement {
    const files: File[] = [];

    return (
      <main>
        <div>완료된 파일</div>
        <ul>
          {files.map((file) => (
            <li>{file.name}</li>
          ))}
        </ul>
      </main>
    );
  }
}
