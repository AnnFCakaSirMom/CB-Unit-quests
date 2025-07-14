
export interface Quest {
  id: string;
  description: string;
  completed: boolean;
}

export interface Unit {
  id: string;
  name: string;
  quests: Quest[];
}

export interface Season {
  id: string;
  name: string;
  units: Unit[];
}

// Add File System Access API types for browsers that support it.
// This avoids TypeScript errors for properties that are not yet part of the standard DOM library.
declare global {
  interface Window {
    showOpenFilePicker(options?: any): Promise<FileSystemFileHandle[]>;
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
    getFile(): Promise<File>;
    readonly name: string;
  }

  interface FileSystemWritableFileStream {
    write(data: any): Promise<void>;
    close(): Promise<void>;
  }
}
