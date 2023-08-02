import { useCallback, useEffect } from 'react';

import { Store } from './store';
import { FfmpegFile, ffmpegService } from '@/core';

export class SelectFileStore extends Store<FfmpegFile[]> {
  public static of() {
    return new SelectFileStore([]);
  }

  public useEnqueue() {
    const setFiles = this.useSetState();

    return useCallback(
      async (origins: FileList) => {
        if (origins.length === 0) {
          return;
        }

        const files: FfmpegFile[] = await Promise.all(
          Array(origins.length)
            .fill(null)
            .map((_, i) => ffmpegService.ffprobe(origins.item(i))),
        );

        setFiles((prev) => files.concat(prev));
      },
      [setFiles],
    );
  }

  public useDequeue(): FfmpegFile | null {
    const [files, setFiles] = this.useState();

    const file = files.shift();

    useEffect(() => {
      if (file) {
        setFiles((prev) => [...prev].slice(1));
      }
    }, [file, setFiles]);

    return file;
  }
}

export const selectFileStore = SelectFileStore.of();
